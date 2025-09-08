import prisma from '../prisma/prisma.js';

export const createCheckOut = async (data) => {
    try {
      // First check if the contract exists and has a check-in but no check-out
      const existingContract = await prisma.contract.findUnique({
        where: {
          contract_id: parseInt(data.contract_id),
        },
        include: {
          checkIn: true,
          checkOut: true,
          tenant: true,
          room: true,
        },
      });

      if (!existingContract) {
        throw new Error("Contract not found");
      }

      if (!existingContract.checkIn) {
        throw new Error("Cannot check out without checking in first");
      }

      if (existingContract.checkOut) {
        throw new Error("Check-out already exists for this contract");
      }

      // Check for outstanding payments
      const outstandingPayments = await prisma.outstandingPayment.findMany({
        where: {
          contract_id: parseInt(data.contract_id),
          status: {
            in: ["unpaid", "partially_paid", "overdue"],
          },
        },
      });

      if (outstandingPayments.length > 0) {
        throw new Error("Cannot check out with pending payments");
      }

      // Create the check-out with transaction to handle problems
      return await prisma.$transaction(async (prisma) => {
        const checkOut = await prisma.checkOut.create({
          data: {
            contract_id: parseInt(data.contract_id),
            checkOutDate: new Date(data.checkOutDate),
            remarks: data.remarks,
            problems: {
              create:
                data.problems?.map((problem) => ({
                  description: problem.description,
                  status: problem.status || "new",
                  damage_cost: parseFloat(problem.damage_cost || 0),
                  created_at: new Date(),
                })) || [],
            },
          },
          include: {
            contract: {
              include: {
                room: {
                  include: {
                    details: true,
                  },
                },
                tenant: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            problems: true,
          },
        });

        // Update room status
        await prisma.room.update({
          where: {
            room_id: existingContract.room_id,
          },
          data: {
            status: "available",
          },
        });

        // Update contract status
        await prisma.contract.update({
          where: {
            contract_id: parseInt(data.contract_id),
          },
          data: {
            status: "terminated",
          },
        });

        return checkOut;
      });
    } catch (error) {
      throw new Error(`Error creating check-out: ${error.message}`);
    }
  }

export const getAllCheckOuts = async () => {
    try {
      return await prisma.checkOut.findMany({
        include: {
          contract: {
            include: {
              room: {
                include: {
                  details: true,
                },
              },
              tenant: {
                include: {
                  user: true,
                },
              },
            },
          },
          problems: {
            orderBy: {
              created_at: "desc",
            },
          },
        },
        orderBy: {
          checkOutDate: "desc",
        },
      });
    } catch (error) {
      throw new Error(`Error fetching check-outs: ${error.message}`);
    }
  }

export const getCheckOutById = async (checkOutId) => {
    try {
      return await prisma.checkOut.findUnique({
        where: {
          checkOut_id: parseInt(checkOutId),
        },
        include: {
          contract: {
            include: {
              room: {
                include: {
                  details: true,
                },
              },
              tenant: {
                include: {
                  user: true,
                },
              },
            },
          },
          problems: {
            orderBy: {
              created_at: "desc",
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching check-out: ${error.message}`);
    }
  }

export const getCheckOutByContractId = async (contractId) => {
    try {
      return await prisma.checkOut.findUnique({
        where: {
          contract_id: parseInt(contractId),
        },
        include: {
          contract: {
            include: {
              room: {
                include: {
                  details: true,
                },
              },
              tenant: {
                include: {
                  user: true,
                },
              },
            },
          },
          problems: {
            orderBy: {
              created_at: "desc",
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching check-out: ${error.message}`);
    }
  }

export const updateCheckOut = async (checkOutId, data) => {
    try {
      const checkOutIdInt = parseInt(checkOutId);
      return await prisma.$transaction(async (prisma) => {
        // If there are problem updates
        if (data.problems) {
          // Delete removed problems
          const existingProblems = await prisma.checkoutProblem.findMany({
            where: { checkout_id: checkOutIdInt },
          });

          const existingProblemIds = existingProblems.map((p) => p.problem_id);
          const updatedProblemIds = data.problems
            .filter((p) => p.problem_id)
            .map((p) => parseInt(p.problem_id));

          const problemsToDelete = existingProblemIds.filter(
            (id) => !updatedProblemIds.includes(id)
          );

          if (problemsToDelete.length > 0) {
            await prisma.checkoutProblem.deleteMany({
              where: {
                problem_id: {
                  in: problemsToDelete,
                },
              },
            });
          }

          // Update or create problems
          for (const problem of data.problems) {
            if (problem.problem_id) {
              // Update existing problem
              await prisma.checkoutProblem.update({
                where: {
                  problem_id: parseInt(problem.problem_id),
                },
                data: {
                  description: problem.description,
                  status: problem.status,
                  damage_cost: parseFloat(problem.damage_cost || 0),
                },
              });
            } else {
              // Create new problem
              await prisma.checkoutProblem.create({
                data: {
                  checkout_id: checkOutIdInt,
                  description: problem.description,
                  status: problem.status || "new",
                  damage_cost: parseFloat(problem.damage_cost || 0),
                  created_at: new Date(),
                },
              });
            }
          }
        }

        // Update check-out
        return await prisma.checkOut.update({
          where: {
            checkOut_id: checkOutIdInt,
          },
          data: {
            checkOutDate: data.checkOutDate
              ? new Date(data.checkOutDate)
              : undefined,
            remarks: data.remarks,
          },
          include: {
            contract: {
              include: {
                room: {
                  include: {
                    details: true,
                  },
                },
                tenant: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            problems: {
              orderBy: {
                created_at: "desc",
              },
            },
          },
        });
      });
    } catch (error) {
      throw new Error(`Error updating check-out: ${error.message}`);
    }
  }

export const deleteCheckOut = async (checkOutId) => {
    try {
      const checkOutIdInt = parseInt(checkOutId);

      return await prisma.$transaction(async (prisma) => {
        // Find check-out first
        const checkOut = await prisma.checkOut.findUnique({
          where: {
            checkOut_id: checkOutIdInt,
          },
          include: {
            contract: true,
            problems: true,
          },
        });

        if (!checkOut) {
          throw new Error("Check-out not found");
        }

        // Delete all related problems first
        if (checkOut.problems.length > 0) {
          await prisma.checkoutProblem.deleteMany({
            where: {
              checkout_id: checkOutIdInt,
            },
          });
        }

        // Revert contract and room status if needed
        if (checkOut.contract.status === "terminated") {
          await prisma.contract.update({
            where: {
              contract_id: checkOut.contract.contract_id,
            },
            data: {
              status: "active",
            },
          });

          // Get room and revert status if it's available
          const room = await prisma.room.findUnique({
            where: {
              room_id: checkOut.contract.room_id,
            },
          });

          if (room && room.status === "available") {
            await prisma.room.update({
              where: {
                room_id: room.room_id,
              },
              data: {
                status: "rented",
              },
            });
          }
        }

        // Finally delete the check-out
        return await prisma.checkOut.delete({
          where: {
            checkOut_id: checkOutIdInt,
          },
        });
      });
    } catch (error) {
      throw new Error(`Error deleting check-out: ${error.message}`);
    }
  }

export const getCheckoutProblems = async (checkOutId) => {
    try {
      return await prisma.checkoutProblem.findMany({
        where: {
          checkout_id: parseInt(checkOutId),
        },
        orderBy: {
          created_at: "desc",
        },
      });
    } catch (error) {
      throw new Error(`Error fetching checkout problems: ${error.message}`);
    }
  }

export const updateProblemStatus = async (problemId, status, resolution_notes, damage_cost) => {
    try {
      // Validate status enum if provided
      if (status) {
        const validStatus = ["new", "resolved", "damage"];
        if (!validStatus.includes(status)) {
          throw new Error(
            `Invalid status. Must be one of: ${validStatus.join(", ")}`
          );
        }
      }

      return await prisma.checkoutProblem.update({
        where: {
          problem_id: parseInt(problemId),
        },
        data: {
          status,
          damage_cost: damage_cost ? parseFloat(damage_cost) : undefined,
          resolution_notes,
        },
      });
    } catch (error) {
      throw new Error(`Error updating checkout problem: ${error.message}`);
    }
  }