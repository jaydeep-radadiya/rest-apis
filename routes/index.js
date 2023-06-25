import express from "express";
const router = express.Router();
import { registerController, loginController, userController, refreshController, productController } from "../controllers";
import auth from "../middlewares/auth";
import admin from "../middlewares/admin";

router.post('/register', registerController.register); // we passed function, didn't call it
router.post('/login', loginController.login);
router.get('/me', auth, userController.me);
router.post('/refresh', refreshController.refresh);

// only those can logout who has valid token
router.post('/logout', auth, loginController.logout);

// this middlewares are called in sequence
router.post('/products', [auth, admin], productController.store);

router.put('/products/:id', [auth, admin], productController.update);

router.delete('/products/:id', [auth, admin], productController.destroy);

router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getSingleProduct);

export default router;