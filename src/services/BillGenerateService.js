import prisma from "../prisma/prisma.js";

async function calculateUtilityCost(oldReading, newReading, utilityType) {
    const utilityRate = await prisma.utilityRate.findFirst({
        where: { type: utilityType },
        orderBy: { effectiveFrom: 'desc' }
    });
    if (!utilityRate) {
        throw new Error(`ບໍ່ເຫັນ ອັດຕາສຳລັບ ${utilityType}`);
    }

    const usage = Math.max(0, newReading - oldReading); // ປ້ອງກັນຄ່າລົບ
    return {
        usage: usage,
        rate: utilityRate.ratePerUnit,
        cost: usage * utilityRate.ratePerUnit
    };
}

//ສ້າງຄ່າໃຊ້ຈ່າຍປະຈຳເດືອນສຳລັບຫ້ອງດຽວ (Refactored)
export const generateMonthlyBillForRoom = async (data) => {
    try {
        const { roomId, month, year } = data;

        // 1. ຫາ contract ທີ່ເປີດຢູ່ຂອງຫ້ອງນີ້
        const activeContract = await prisma.contract.findFirst({
            where: { room_id: roomId, status: 'active' },
            include: {
                room: { include: { details: true } },
                tenant: true
            }
        });

        if (!activeContract) {
            throw new Error('ບໍ່ພົບສັນຍາທີ່ເປີດຢູ່ສຳລັບຫ້ອງນີ້');
        }

        // 2. ດຶງຂໍ້ມູນ Meter Reading ໂດຍໃຊ້ Date Range
        const currentMonthStart = new Date(year, month - 1, 1);
        const currentMonthEnd = new Date(year, month, 1);
        
        const previousMonthStart = new Date(year, month - 2, 1);
        const previousMonthEnd = new Date(year, month - 1, 1);

        const currentReading = await prisma.meterReading.findFirst({
            where: {
                room_id: roomId,
                month: {
                    gte: currentMonthStart,
                    lt: currentMonthEnd
                }
            }
        });

        if (!currentReading) {
            throw new Error(`ບໍ່ພົບຂໍ້ມູນກົງເຕີຂອງເດືອນ ${month}/${year} ສຳລັບຫ້ອງ ${roomId}`);
        }

        const previousReading = await prisma.meterReading.findFirst({
            where: {
                room_id: roomId,
                month: {
                    gte: previousMonthStart,
                    lt: previousMonthEnd
                }
            }
        });

        const waterOld = previousReading?.waterNew || 0;
        const electricOld = previousReading?.electricNew || 0;
        const { waterNew, electricNew } = currentReading;


        // 3. ເລີ່ມຄຳນວນຄ່າໃຊ້ຈ່າຍ
        const roomDetails = activeContract.room.details;
        const dueDate = new Date(year, month, 5); // ກຳນົດວັນທີ່ 5 ຂອງເດືອນຖັດໄປ

        let totalAmount = 0;
        const billItems = [];

        // 3.1 ຄ່າເຊົ່າຫ້ອງ
        const roomRent = roomDetails?.price || 0;
        if (roomRent > 0) {
            billItems.push({
                description: `ຄ່າເຊົ່າຫ້ອງ ${activeContract.room.roomNumber} - ${month}/${year}`,
                amount: roomRent,
                type: 'room_rent'
            });
            totalAmount += roomRent;
        }

        // 3.2 ຄ່ານ້ຳ
        const waterCalc = await calculateUtilityCost(waterOld, waterNew, 'water');
        if (waterCalc.cost > 0) {
            billItems.push({
                description: `ຄ່ານ້ຳ ${month}/${year} (${waterCalc.usage} ຫນ່ວຍ × ${waterCalc.rate})`,
                amount: waterCalc.cost,
                type: 'water',
                usage: waterCalc.usage,
                rate: waterCalc.rate
            });
            totalAmount += waterCalc.cost;
        }

        // 3.3 ຄ່າໄຟ
        const electricCalc = await calculateUtilityCost(electricOld, electricNew, 'electric');
        if (electricCalc.cost > 0) {
            billItems.push({
                description: `ຄ່າໄຟຟ້າ ${month}/${year} (${electricCalc.usage} ຫນ່ວຍ × ${electricCalc.rate})`,
                amount: electricCalc.cost,
                type: 'electric',
                usage: electricCalc.usage,
                rate: electricCalc.rate
            });
            totalAmount += electricCalc.cost;
        }

        // 4. ສ້າງ OutstandingPayment
        const outstandingPayment = await prisma.outstandingPayment.create({
            data: {
                contract_id: activeContract.contract_id,
                dueDate: dueDate,
                amountDue: totalAmount,
                status: 'unpaid'
            }
        });

        return {
            bill: {
                outstandingPayment_id: outstandingPayment.outstandingPayment_id,
                roomNumber: activeContract.room.roomNumber,
                tenantName: activeContract.tenant.name,
                month: month,
                year: year,
                dueDate: dueDate,
                totalAmount: totalAmount,
                items: billItems
            },
            contract: activeContract,
            outstandingPayment
        };

    } catch (error) {
        throw error;
    }
};

// Other functions remain the same...

// ສ້າງຄ່າໃຊ້ຈ່າຍປະຈຳເດືອນສຳລັບຫຼາຍຫ້ອງ (Refactored)
export const generateMonthlyBillsForMultipleRooms = async (data) => {
    try {
        const { roomIds, month, year } = data;
        const results = [];
        const errors = [];

        for (const roomId of roomIds) {
            try {
                const bill = await generateMonthlyBillForRoom({ roomId, month, year });
                results.push(bill);
            } catch (error) {
                errors.push({
                    roomId,
                    error: error.message
                });
            }
        }

        return {
            success: results,
            errors: errors,
            summary: {
                totalRooms: roomIds.length,
                successCount: results.length,
                errorCount: errors.length,
                totalAmount: results.reduce((sum, result) => sum + result.bill.totalAmount, 0)
            }
        };

    } catch (error) {
        throw error;
    }
};

// ສ້າງຄ່າໃຊ້ຈ່າຍປະຈຳເດືອນສຳລັບທັງໝົດຫ້ອງທີ່ມີສັນຍາເປີດຢູ່ (Refactored)
export const generateMonthlyBillsForAllActiveRooms = async (data) => {
    try {
        const { month, year } = data;

        const activeContracts = await prisma.contract.findMany({
            where: { status: 'active' },
            select: { room_id: true }
        });

        if (activeContracts.length === 0) {
            return { success: [], errors: [], summary: { totalRooms: 0, successCount: 0, errorCount: 0, totalAmount: 0 } };
        }

        const roomIds = activeContracts.map(contract => contract.room_id);

        return await generateMonthlyBillsForMultipleRooms({
            roomIds,
            month,
            year
        });

    } catch (error) {
        throw error;
    }
};

// ເບິ່ງຄ່າໃຊ້ຈ່າຍປະຈຳເດືອນຂອງຫ້ອງ
export const getMonthlyBillByRoom = async (roomId, month, year) => {
    try {
        const billDate = new Date(year, month - 1, 1);

        const outstandingPayment = await prisma.outstandingPayment.findFirst({
            where: {
                contract: { room_id: roomId },
                dueDate: {
                    gte: billDate,
                    lt: new Date(year, month, 1)
                }
            },
            include: {
                contract: {
                    include: {
                        room: true,
                        tenant: true
                    }
                }
            }
        });

        if (!outstandingPayment) {
            throw new Error('ບໍ່ພົບບິນສຳລັບເດືອນທີ່ລະບຸ');
        }

        const meterReading = await prisma.meterReading.findFirst({
            where: {
                room_id: roomId,
                month: billDate
            }
        });

        return {
            outstandingPayment,
            meterReading,
        };

    } catch (error) {
        throw error;
    }
};

// ເບິ່ງສະຖິຕິຄ່າໃຊ້ຈ່າຍປະຈຳເດືອນ
export const getMonthlyBillStatistics = async (month, year) => {
    try {
        const billDate = new Date(year, month - 1, 1);
        const nextMonth = new Date(year, month, 1);

        const outstandingPayments = await prisma.outstandingPayment.findMany({
            where: {
                dueDate: {
                    gte: billDate,
                    lt: nextMonth
                }
            },
            include: {
                contract: {
                    include: {
                        room: true,
                        tenant: true
                    }
                }
            }
        });

        const totalBills = outstandingPayments.length;
        const totalAmount = outstandingPayments.reduce((sum, payment) => sum + payment.amountDue, 0);
        const paidBills = outstandingPayments.filter(payment => payment.status === 'paid').length;
        const unpaidBills = outstandingPayments.filter(payment => payment.status === 'unpaid').length;
        const overdueBills = outstandingPayments.filter(payment => payment.status === 'overdue' && new Date() > payment.dueDate).length;

        return {
            month,
            year,
            statistics: {
                totalBills,
                totalAmount,
                paidBills,
                unpaidBills,
                overdueBills,
                collectionRate: totalBills > 0 ? (paidBills / totalBills) * 100 : 0
            },
            bills: outstandingPayments
        };

    } catch (error) {
        throw error;
    }
};