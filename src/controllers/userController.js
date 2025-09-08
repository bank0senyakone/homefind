// import {
//   createUser as _createUser,
//   getAllUsers as _getAllUsers,
//   getUserById as _getUserById,
//   updateUser as _updateUser,
//   deleteUser as _deleteUser,
//   getUserByEmail as _getUserByEmail,
// } from "../services/userService";

// class UserController {
//   async createUser(req, res) {
//     try {
//       const { username, email, phoneNumber, password, role, profile } =
//         req.body;

//       // Validate required fields
//       if (!username || !email || !phoneNumber || !password || !role) {
//         return res.status(400).json({
//           error:
//             "Required fields: username, email, phoneNumber, password, role",
//         });
//       }

//       // Validate email format
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email)) {
//         return res.status(400).json({
//           error: "Invalid email format",
//         });
//       }

//       // Validate phone number format
//       const phoneRegex = /^\+?[\d\s-]{10,}$/;
//       if (!phoneRegex.test(phoneNumber)) {
//         return res.status(400).json({
//           error: "Invalid phone number format",
//         });
//       }

//       // Validate role
//       const validRoles = ["admin", "user", "staff"];
//       if (!validRoles.includes(role)) {
//         return res.status(400).json({
//           error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
//         });
//       }

//       const user = await _createUser(req.body);
//       res.status(201).json(user);
//     } catch (error) {
//       if (error.message.includes("Unique constraint")) {
//         return res.status(400).json({ error: "Email already in use" });
//       }
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async getAllUsers(req, res) {
//     try {
//       const { role, search } = req.query;
//       let users = await _getAllUsers();

//       // Filter by role if provided
//       if (role) {
//         users = users.filter((user) => user.role === role);
//       }

//       // Filter by search term if provided
//       if (search) {
//         const searchLower = search.toLowerCase();
//         users = users.filter(
//           (user) =>
//             user.username.toLowerCase().includes(searchLower) ||
//             user.email.toLowerCase().includes(searchLower) ||
//             user.phoneNumber.includes(search)
//         );
//       }

//       res.json(users);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async getUserById(req, res) {
//     try {
//       const user = await _getUserById(req.params.id);
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       res.json(user);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async updateUser(req, res) {
//     try {
//       const { username, email, phoneNumber, password, role, profile } =
//         req.body;

//       // Validate if any field is provided
//       if (
//         !username &&
//         !email &&
//         !phoneNumber &&
//         !password &&
//         !role &&
//         !profile
//       ) {
//         return res.status(400).json({
//           error: "At least one field must be provided for update",
//         });
//       }

//       // Validate email format if provided
//       if (email) {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//           return res.status(400).json({
//             error: "Invalid email format",
//           });
//         }
//       }

//       // Validate phone number format if provided
//       if (phoneNumber) {
//         const phoneRegex = /^\+?[\d\s-]{10,}$/;
//         if (!phoneRegex.test(phoneNumber)) {
//           return res.status(400).json({
//             error: "Invalid phone number format",
//           });
//         }
//       }

//       // Validate role if provided
//       if (role) {
//         const validRoles = ["admin", "user", "staff"];
//         if (!validRoles.includes(role)) {
//           return res.status(400).json({
//             error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
//           });
//         }
//       }

//       const user = await _updateUser(req.params.id, req.body);
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       res.json(user);
//     } catch (error) {
//       if (error.message.includes("Unique constraint")) {
//         return res.status(400).json({ error: "Email already in use" });
//       }
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async deleteUser(req, res) {
//     try {
//       await _deleteUser(req.params.id);
//       res.json({ message: "User deleted successfully" });
//     } catch (error) {
//       if (error.message.includes("active contracts")) {
//         return res.status(400).json({
//           error: "Cannot delete user with active contracts",
//         });
//       }
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async getUserByEmail(req, res) {
//     try {
//       const user = await _getUserByEmail(req.params.email);
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       res.json(user);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
// }

// export default new UserController();
