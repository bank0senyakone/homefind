import prisma from '../prisma/prisma.js';

export const createOutstandingPayment = async (data) => {
    try {
        const { contract_id, dueDate, amountDue, status } = data;
        
        // Validate required fields
        if (!contract_id || !dueDate || !amountDue || !status) {
            throw new Error('Required fields missing');
        }

        // Validate status enum
        const validStatus = ['unpaid', 'partially_paid', 'paid', 'overdue'];
        if (!validStatus.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatus.join(', ')}`);
        }

        // Validate amount
        if (isNaN(parseFloat(amountDue)) || parseFloat(amountDue) <= 0) {
            throw new Error('Amount due must be a positive number');
        }

        // Check if contract exists and is active
        const contract = await prisma.contract.findUnique({
            where: { contract_id: parseInt(contract_id) }
        });

        if (!contract) {
            throw new Error('Contract not found');
        }

        if (contract.status !== 'active') {
            throw new Error('Cannot create outstanding payment for inactive contract');
        }

        return await prisma.outstandingPayment.create({
            data: {
                contract_id: parseInt(contract_id),
                dueDate: new Date(dueDate),
                amountDue: parseFloat(amountDue),
                status
            },
            include: {
                contract: {
                    include: {
                        tenant: {
                            include: {
                                user: true
                            }
                        },
                        room: {
                            include: {
                                details: true
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        throw new Error(`Error creating outstanding payment: ${error.message}`);
    }
}

export const getOutstandingPayments = async (filters = {}) => {
    try {
        const { status, contract_id, dueDate, overdue } = filters;

        let where = {};

        if (status) {
            where.status = status;
        }

        if (contract_id) {
            where.contract_id = parseInt(contract_id);
        }

        if (dueDate) {
            where.dueDate = new Date(dueDate);
        }

        if (overdue) {
            where.dueDate = {
                lt: new Date()
            };
            where.status = 'unpaid';
        }

        return await prisma.outstandingPayment.findMany({
            where,
            include: {
                contract: {
                    include: {
                        tenant: {
                            include: {
                                user: true
                            }
                        },
                        room: {
                            include: {
                                details: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
    } catch (error) {
        throw new Error(`Error fetching outstanding payments: ${error.message}`);
    }
}

export const getOutstandingPaymentById = async (outstandingPaymentId) => {
    try {
        return await prisma.outstandingPayment.findUnique({
            where: { 
                outstandingPayment_id: parseInt(outstandingPaymentId) 
            },
            include: {
                contract: {
                    include: {
                        tenant: {
                            include: {
                                user: true
                            }
                        },
                        room: {
                            include: {
                                details: true
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        throw new Error(`Error fetching outstanding payment: ${error.message}`);
    }
}

export const updateOutstandingPayment = async (outstandingPaymentId, data) => {
    try {
        const { dueDate, amountDue, status } = data;

        // Validate status if provided
        if (status) {
            const validStatus = ['unpaid', 'partially_paid', 'paid', 'overdue'];
            if (!validStatus.includes(status)) {
                throw new Error(`Invalid status. Must be one of: ${validStatus.join(', ')}`);
            }
        }

        // Validate amount if provided
        if (amountDue) {
            if (isNaN(parseFloat(amountDue)) || parseFloat(amountDue) <= 0) {
                throw new Error('Amount due must be a positive number');
            }
        }

        return await prisma.outstandingPayment.update({
            where: { 
                outstandingPayment_id: parseInt(outstandingPaymentId) 
            },
            data: {
                dueDate: dueDate ? new Date(dueDate) : undefined,
                amountDue: amountDue ? parseFloat(amountDue) : undefined,
                status
            },
            include: {
                contract: {
                    include: {
                        tenant: {
                            include: {
                                user: true
                            }
                        },
                        room: {
                            include: {
                                details: true
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        throw new Error(`Error updating outstanding payment: ${error.message}`);
    }
}

export const deleteOutstandingPayment = async (outstandingPaymentId) => {
    try {
        const outstandingPayment = await prisma.outstandingPayment.findUnique({
            where: { 
                outstandingPayment_id: parseInt(outstandingPaymentId) 
            },
            include: {
                contract: true
            }
        });

        if (!outstandingPayment) {
            throw new Error('Outstanding payment not found');
        }

        if (outstandingPayment.status === 'partially_paid') {
            throw new Error('Cannot delete partially paid outstanding payment');
        }

        return await prisma.outstandingPayment.delete({
            where: { 
                outstandingPayment_id: parseInt(outstandingPaymentId) 
            }
        });
    } catch (error) {
        throw new Error(`Error deleting outstanding payment: ${error.message}`);
    }
}

export const getOutstandingPaymentsByContract = async (contractId) => {
    try {
        return await prisma.outstandingPayment.findMany({
            where: {
                contract_id: parseInt(contractId)
            },
            include: {
                contract: {
                    include: {
                        tenant: {
                            include: {
                                user: true
                            }
                        },
                        room: {
                            include: {
                                details: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
    } catch (error) {
        throw new Error(`Error fetching contract outstanding payments: ${error.message}`);
    }
}

export const updateOverduePayments = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return await prisma.outstandingPayment.updateMany({
            where: {
                dueDate: {
                    lt: today
                },
                status: 'unpaid'
            },
            data: {
                status: 'overdue'
            }
        });
    } catch (error) {
        throw new Error(`Error updating overdue payments: ${error.message}`);
    }
}