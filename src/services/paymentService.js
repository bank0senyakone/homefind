
import prisma from '../prisma/prisma.js';


async function calculateUtilityCost(oldReading, newReading, utilityType) {
    const utilityRate = await prisma.utilityRate.findFirst({
        where:{type:utilityType},
        orderBy:{ effectiveFrom:'desc'}
    });
    if(!utilityRate){
        throw new Error(`ບໍ່ຜົມອັດຕາສຳລັບ ${utilityType}`)
    }
    const usage = newReading - oldReading;
    return usage * utilityRate.ratePerUnit;
}

export const createPayment = async (data) => {
    try {
        const { contractId, totalAmount, paymentDate, items, slip } = data;
    
    return await prisma.payment.create({
        data: {
            contract_id : contractId,
            totalAmount,
            paymentDate: new Date(paymentDate),
            items: {
                create: items
            },
            slip: slip ? {
                create: {
                    slipImageUrl: slip.slipImageUrl,
                    submittedDate: new Date(slip.submittedDate)
                }
            } : undefined
        },
        include: {
            items: true,
            slip: true
        }
    });
    } catch (error) {
        throw error;
    }
}

export const getPayments = async (filters = {}) => {
    try {
         return await prisma.payment.findMany({
        where: filters,
        include: {
            items: true,
            slip: true,
            contract: true
        }
    });
    } catch (error) {
        throw error;
    }
}

export const getPaymentById = async (paymentId) => {
    try {
        return await prisma.payment.findUnique({
        where: { payment_id: paymentId },
        include: {
            items: true,
            slip: true,
            constract: true
        }
    });
    } catch (error) {
        throw error
    }
}

export const updatePayment = async (paymentId, data) => {
    try {
            const { items, slip, ...paymentData } = data;
    
    // Update payment
    const updatedPayment = await prisma.payment.update({
        where: { payment_id: paymentId },
        data: {
            ...paymentData,
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined
        }
    });

    // Update items if provided
    if (items) {
        await prisma.paymentItem.deleteMany({
            where: { payment_id: paymentId }
        });
        
        await prisma.paymentItem.createMany({
            data: items.map(item => ({ ...item, payment_id:paymentId }))
        });
    }

    // Update slip if provided
    if (slip) {
        const existingSlip = await prisma.paymentSlip.findUnique({
            where: { payment_id:paymentId }
        });
        if (existingSlip) {
            await prisma.paymentSlip.update({
                where: { payment_id:paymentId },
                data: {
                    slipImageUrl: slip.slipImageUrl,
                    submittedDate: new Date(slip.submittedDate)
                }
            });
        } else {
            await prisma.paymentSlip.create({
                data: {
                    payment_id:paymentId,
                    slipImageUrl: slip.slipImageUrl,
                    submittedDate: new Date(slip.submittedDate)
                }
            });
        }
    }

    return getPaymentById(paymentId);
    } catch (error) {
        throw error
    }
}

export const deletePayment = async (paymentId) => {
    try{
        await prisma.paymentItem.deleteMany({
            where: { payment_id:paymentId }
    });
    
        await prisma.paymentSlip.deleteMany({
            where: { payment_id:paymentId }
    });

        return await prisma.payment.delete({
            where: { payment_id: paymentId }
    });
    }
    catch(error){
         throw error;
    }
}
//ຟັງຊັນເສີມສຳລັບເບິ່ງປະຫວັດການຊຳລະເງິນ
export const getPaymentHistory = async (contractId, options ={})=>{
    try {
        const{ page = 1, limit = 10 } = options;

        const payments = await prisma.payment.findMany({
            where:{ contract_id: contractId},
            include:{
                items: true,
                slip:true,
                contract:{
                    include:{
                        tenant: true,
                        room: true
                    }
                }
            },
            orderBy:{ paymentDate: 'desc'},
            skip: (page - 1) * limit,
            take:  parseInt(limit)
        });

        const totalPayments = await prisma.payment.count({
            where:{ contract_id: contractId}
        });

        return{
            payments,
            pagination:{
                currentPage : parseInt(page),
                totalPages: Math.ceil(totalPayments / limit),
                totalPayments
            }
        };
    } catch (error) {
        throw error;
    }
}

export const getOutstandingPayments = async (contractId) => {
    try {
        const outstandingPayments = await prisma.outstandingPayment.findMany({
            where: {
                contract_id: contractId,
                status: { in: ['unpaid', 'partially_paid', 'overdue'] }
            },
            include: {
                contract: {
                    include: {
                        tenant: true,
                        room: true
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        const totalOutstanding = outstandingPayments.reduce(
            (sum, payment) => sum + payment.amountDue, 0
        );

        return {
            outstandingPayments,
            totalOutstanding
        };

    } catch (error) {
        throw error;
    }
}

export const createMultiMonthPayment = async (data) => {
    try {
        const { contractId, months, paymentSlipUrl } = data;

        // ກວດສອບ contract
        const contract = await prisma.contract.findUnique({
            where: { contract_id: contractId },
            include: {
                room: {
                    include: { details: true }
                }
            }
        });

        if (!contract) {
            throw new Error('ບໍ່ພົບສັນຍາ');
        }

        if (contract.status !== 'active') {
            throw new Error('ສັນຍານີ້ບໍ່ໄດ້ຢູ່ໃນສະຖານະເປີດໃຊ້ງານ');
        }

        const roomPrice = contract.room.details?.price || 0;
        let totalAmount = 0;
        const paymentItems = [];

        // ຄຳນວນຄ່າທີ່ພັກສຳລັບແຕ່ລະເດືອນ
        for (const month of months) {
            paymentItems.push({
                description: `ຄ່າທີ່ພັກເດືອນ ${month}`,
                amount: roomPrice
            });
            totalAmount += roomPrice;
        }

        // ຄຳນວນຄ່າສາທາລະນູປະໂພກສຳລັບແຕ່ລະເດືອນ
        for (const month of months) {
            const monthDate = new Date(month);
            const meterReading = await prisma.meterReading.findFirst({
                where: {
                    contract_id: contractId,
                    month: monthDate
                }
            });

            if (meterReading) {
                // ຄ່ານ້ຳ
                const waterCost = await calculateUtilityCost(
                    meterReading.waterOld,
                    meterReading.waterNew,
                    'water'
                );

                // ຄ່າໄຟຟ້າ
                const electricCost = await calculateUtilityCost(
                    meterReading.electricOld,
                    meterReading.electricNew,
                    'electric'
                );

                paymentItems.push(
                    {
                        description: `ຄ່ານ້ຳເດືອນ ${month}`,
                        amount: waterCost
                    },
                    {
                        description: `ຄ່າໄຟຟ້າເດືອນ ${month}`,
                        amount: electricCost
                    }
                );

                totalAmount += waterCost + electricCost;
            }
        }

        // ສ້າງການຊຳລະເງິນໃນ transaction
        const result = await prisma.$transaction(async (tx) => {
            // ສ້າງ Payment
            const payment = await tx.payment.create({
                data: {
                    contract_id: contractId,
                    totalAmount: totalAmount,
                    paymentDate: new Date(),
                    items: {
                        create: paymentItems
                    }
                },
                include: {
                    items: true
                }
            });

            // ສ້າງ PaymentSlip ຖ້າມີ
            if (paymentSlipUrl) {
                await tx.paymentSlip.create({
                    data: {
                        payment_id: payment.payment_id,
                        slipImageUrl: paymentSlipUrl,
                        submittedDate: new Date()
                    }
                });
            }

            // ອັບເດດ OutstandingPayments ທີ່ຈ່າຍແລ້ວ
            await tx.outstandingPayment.updateMany({
                where: {
                    contract_id: contractId,
                    status: { in: ['unpaid', 'partially_paid', 'overdue'] },
                    dueDate: {
                        in: months.map(month => new Date(month))
                    }
                },
                data: {
                    status: 'paid'
                }
            });

            return payment;
        });

        return result;

    } catch (error) {
        throw error;
    }
};