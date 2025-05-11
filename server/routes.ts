import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertMenuItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertReservationSchema,
  UserRole
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import multer from "multer";
import path from "path";
import fs from "fs";

// Define WebSocket message types
type WebSocketMessage = {
  type: string;
  data: any;
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients: WebSocket[] = [];
  
  wss.on('connection', (ws) => {
    clients.push(ws);
    
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage;
        handleWebSocketMessage(parsedMessage, ws, clients);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      const index = clients.indexOf(ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
    
    // Send initial data
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'connection', data: { status: 'connected' } }));
    }
  });
  
  // Broadcast message to all connected admin clients
  const broadcastToAdmins = (message: WebSocketMessage) => {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };
  
  // Handle WebSocket messages
  const handleWebSocketMessage = (message: WebSocketMessage, sender: WebSocket, allClients: WebSocket[]) => {
    switch (message.type) {
      case 'ping':
        sender.send(JSON.stringify({ type: 'pong', data: { time: new Date().toISOString() } }));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };
  
  // Configure session and passport
  app.use(session({
    secret: process.env.SESSION_SECRET || 'pauls-restaurant-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure file upload storage
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage_multer });
  
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(uploadsDir));
  
  // Configure passport local strategy
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        if (user.password !== password) { // In a real app, use proper password hashing
          return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Not authenticated' });
  };
  
  // Check if user is admin
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === UserRole.ADMIN) {
      return next();
    }
    res.status(403).json({ message: 'Not authorized' });
  };
  
  // API Routes
  
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // Create user
      const newUser = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating user' });
      }
    }
  });
  
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as any;
      res.json({ authenticated: true, user: userWithoutPassword });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories' });
    }
  });
  
  app.post('/api/categories', isAdmin, async (req, res) => {
    try {
      const categoryData = z.object({
        name: z.string().min(1)
      }).parse(req.body);
      
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating category' });
      }
    }
  });
  
  app.put('/api/categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = z.object({
        name: z.string().min(1)
      }).parse(req.body);
      
      const updatedCategory = await storage.updateCategory(id, categoryData);
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error updating category' });
      }
    }
  });
  
  app.delete('/api/categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting category' });
    }
  });
  
  // Menu item routes
  app.get('/api/menu-items', async (req, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching menu items' });
    }
  });
  
  app.get('/api/menu-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching menu item' });
    }
  });
  
  app.get('/api/categories/:id/menu-items', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const menuItems = await storage.getMenuItemsByCategory(categoryId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching menu items by category' });
    }
  });
  
  app.post('/api/menu-items', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const menuItemData = {
        ...req.body,
        price: parseFloat(req.body.price),
        categoryId: parseInt(req.body.categoryId),
        available: req.body.available === 'true',
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
      };
      
      const validatedData = insertMenuItemSchema.parse(menuItemData);
      const newMenuItem = await storage.createMenuItem(validatedData);
      
      res.status(201).json(newMenuItem);
      
      // Notify connected clients about the new menu item
      broadcastToAdmins({ type: 'menu-item-created', data: newMenuItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating menu item' });
      }
    }
  });
  
  app.put('/api/menu-items/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const menuItemData: any = {
        ...req.body
      };
      
      if (req.body.price) {
        menuItemData.price = parseFloat(req.body.price);
      }
      
      if (req.body.categoryId) {
        menuItemData.categoryId = parseInt(req.body.categoryId);
      }
      
      if (req.body.available !== undefined) {
        menuItemData.available = req.body.available === 'true';
      }
      
      if (req.file) {
        menuItemData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const updatedMenuItem = await storage.updateMenuItem(id, menuItemData);
      
      if (!updatedMenuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      res.json(updatedMenuItem);
      
      // Notify connected clients about the updated menu item
      broadcastToAdmins({ type: 'menu-item-updated', data: updatedMenuItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error updating menu item' });
      }
    }
  });
  
  app.delete('/api/menu-items/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMenuItem(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      res.json({ message: 'Menu item deleted successfully' });
      
      // Notify connected clients about the deleted menu item
      broadcastToAdmins({ type: 'menu-item-deleted', data: { id } });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting menu item' });
    }
  });
  
  // Order routes
  app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (user.role === UserRole.ADMIN) {
        const orders = await storage.getAllOrders();
        return res.json(orders);
      }
      
      const orders = await storage.getOrdersByUser(user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
  });
  
  app.get('/api/orders/active', isAdmin, async (req, res) => {
    try {
      const orders = await storage.getActiveOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching active orders' });
    }
  });
  
  app.get('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const user = req.user as any;
      if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      
      const orderItems = await storage.getOrderItems(id);
      
      res.json({ ...order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching order' });
    }
  });
  
  app.post('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      const orderData = {
        ...req.body,
        userId: user.id
      };
      
      const validatedData = insertOrderSchema.parse(orderData);
      const newOrder = await storage.createOrder(validatedData);
      
      // Create order items
      const orderItems = req.body.items || [];
      const createdItems = [];
      
      for (const item of orderItems) {
        const orderItemData = {
          orderId: newOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price
        };
        
        const validatedItem = insertOrderItemSchema.parse(orderItemData);
        const newOrderItem = await storage.createOrderItem(validatedItem);
        createdItems.push(newOrderItem);
      }
      
      res.status(201).json({ ...newOrder, items: createdItems });
      
      // Notify connected clients about the new order
      broadcastToAdmins({ 
        type: 'order-created', 
        data: { ...newOrder, items: createdItems }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating order' });
      }
    }
  });
  
  app.put('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const user = req.user as any;
      if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
      
      const updatedOrder = await storage.updateOrder(id, req.body);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(updatedOrder);
      
      // Notify connected clients about the updated order
      broadcastToAdmins({ type: 'order-updated', data: updatedOrder });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error updating order' });
      }
    }
  });
  
  // Reservation routes
  app.get('/api/reservations', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (user.role === UserRole.ADMIN) {
        const reservations = await storage.getAllReservations();
        return res.json(reservations);
      }
      
      const reservations = await storage.getReservationsByUser(user.id);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reservations' });
    }
  });
  
  app.get('/api/reservations/active', isAdmin, async (req, res) => {
    try {
      const reservations = await storage.getActiveReservations();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching active reservations' });
    }
  });
  
  app.get('/api/reservations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservation(id);
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      const user = req.user as any;
      if (user.role !== UserRole.ADMIN && reservation.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to view this reservation' });
      }
      
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reservation' });
    }
  });
  
  app.post('/api/reservations', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      const reservationData = {
        ...req.body,
        userId: user.id,
        date: new Date(req.body.date)
      };
      
      const validatedData = insertReservationSchema.parse(reservationData);
      const newReservation = await storage.createReservation(validatedData);
      
      res.status(201).json(newReservation);
      
      // Notify connected clients about the new reservation
      broadcastToAdmins({ type: 'reservation-created', data: newReservation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating reservation' });
      }
    }
  });
  
  app.put('/api/reservations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservation(id);
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      const user = req.user as any;
      if (user.role !== UserRole.ADMIN && reservation.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to update this reservation' });
      }
      
      const reservationData = { ...req.body };
      if (req.body.date) {
        reservationData.date = new Date(req.body.date);
      }
      
      const updatedReservation = await storage.updateReservation(id, reservationData);
      
      if (!updatedReservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      res.json(updatedReservation);
      
      // Notify connected clients about the updated reservation
      broadcastToAdmins({ type: 'reservation-updated', data: updatedReservation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error updating reservation' });
      }
    }
  });
  
  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching settings' });
    }
  });
  
  app.put('/api/settings', isAdmin, upload.single('logo'), async (req, res) => {
    try {
      const settingsData: any = {
        ...req.body
      };
      
      if (req.file) {
        settingsData.logoUrl = `/uploads/${req.file.filename}`;
      }
      
      const updatedSettings = await storage.updateSettings(settingsData);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: 'Settings not found' });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: 'Error updating settings' });
    }
  });
  
  // Location routes
  app.get('/api/locations', async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching locations' });
    }
  });
  
  app.get('/api/locations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
      
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching location' });
    }
  });
  
  app.post('/api/locations', isAdmin, async (req, res) => {
    try {
      const locationData = z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        phone: z.string().min(1),
        openingHours: z.string().min(1)
      }).parse(req.body);
      
      const newLocation = await storage.createLocation(locationData);
      res.status(201).json(newLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating location' });
      }
    }
  });
  
  app.put('/api/locations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const locationData = z.object({
        name: z.string().min(1).optional(),
        address: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        openingHours: z.string().min(1).optional()
      }).parse(req.body);
      
      const updatedLocation = await storage.updateLocation(id, locationData);
      
      if (!updatedLocation) {
        return res.status(404).json({ message: 'Location not found' });
      }
      
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error updating location' });
      }
    }
  });
  
  app.delete('/api/locations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLocation(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Location not found' });
      }
      
      res.json({ message: 'Location deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting location' });
    }
  });
  
  // PayPal routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });
  
  return httpServer;
}
