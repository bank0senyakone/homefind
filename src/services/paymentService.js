import prisma from '../prisma/prisma.js';

export const createPayment = async (data) => {
    const { contractId, totalAmount, paymentDate, status, items, slip } = data;
    
    return await prisma.payment.create({
        data: {
            contractId,
            totalAmount,
            paymentDate: new Date(paymentDate),
            status,
            items: {
                create: items
            },
            slip: slip ? {
                create: {
                    ...slip,
                    submittedDate: new Date(slip.submittedDate)
                }
            } : undefined
        },
        include: {
            items: true,
            slip: true
        }
    });
}

export const getPayments = async (filters = {}) => {
    return await prisma.payment.findMany({
        where: filters,
        include: {
            items: true,
            slip: true,
            constract: true
        }
    });
}

export const getPaymentById = async (paymentId) => {
    return await prisma.payment.findUnique({
        where: { paymentId },
        include: {
            items: true,
            slip: true,
            constract: true
        }
    });
}

export const updatePayment = async (paymentId, data) => {
    const { items, slip, ...paymentData } = data;
    
    // Update payment
    const updatedPayment = await prisma.payment.update({
        where: { paymentId },
        data: {
            ...paymentData,
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined
        }
    });

    // Update items if provided
    if (items) {
        await prisma.paymentItem.deleteMany({
            where: { paymentId }
        });
        
        await prisma.paymentItem.createMany({
            data: items.map(item => ({ ...item, paymentId }))
        });
    }

    // Update slip if provided
    if (slip) {
        if (updatedPayment.slip) {
            await prisma.paymentSlip.update({
                where: { paymentId },
                data: {
                    ...slip,
                    submittedDate: new Date(slip.submittedDate)
                }
            });
        } else {
            await prisma.paymentSlip.create({
                data: {
                    ...slip,
                    paymentId,
                    submittedDate: new Date(slip.submittedDate)
                }
            });
        }
    }

    return getPaymentById(paymentId);
}

export const deletePayment = async (paymentId) => {
    await prisma.paymentItem.deleteMany({
        where: { paymentId }
    });
    
    await prisma.paymentSlip.deleteMany({
        where: { paymentId }
    });

    return await prisma.payment.delete({
        where: { paymentId }
    });
}