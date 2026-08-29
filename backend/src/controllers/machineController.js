import Machine from '../models/Machine.js';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const count = await Machine.countDocuments();
    const machines = await Machine.find()
      .skip(skip)
      .limit(limit);

    res.json({
      machines,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single machine by ID
// @route   GET /api/machines/:id
// @access  Public
export const getMachineById = async (req, res, next) => {
  try {
    // Note: machineId in DB vs MongoDB _id. We'll search by machineId string first, then fallback to _id
    let machine = await Machine.findOne({ machineId: req.params.id });
    if (!machine) {
      // Fallback for mongoose ObjectId if needed
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        machine = await Machine.findById(req.params.id);
      }
    }

    if (machine) {
      res.json(machine);
    } else {
      res.status(404);
      throw new Error('Machine not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new machine
// @route   POST /api/machines
// @access  Public/Admin
export const addMachine = async (req, res, next) => {
  try {
    const machine = new Machine(req.body);
    const createdMachine = await machine.save();
    res.status(201).json(createdMachine);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a machine
// @route   PUT /api/machines/:id
// @access  Public/Admin
export const updateMachine = async (req, res, next) => {
  try {
    let machine = await Machine.findOne({ machineId: req.params.id });
    if (!machine && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      machine = await Machine.findById(req.params.id);
    }

    if (machine) {
      Object.assign(machine, req.body);
      const updatedMachine = await machine.save();
      res.json(updatedMachine);
    } else {
      res.status(404);
      throw new Error('Machine not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a machine
// @route   DELETE /api/machines/:id
// @access  Public/Admin
export const deleteMachine = async (req, res, next) => {
  try {
    let machine = await Machine.findOne({ machineId: req.params.id });
    if (!machine && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      machine = await Machine.findById(req.params.id);
    }

    if (machine) {
      await machine.deleteOne();
      res.json({ message: 'Machine removed' });
    } else {
      res.status(404);
      throw new Error('Machine not found');
    }
  } catch (error) {
    next(error);
  }
};
