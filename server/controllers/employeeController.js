const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Get All Employees
// ---------------------------------------------------
exports.getAllEmployees = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, hourly_rate, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error("Get Employees Error:", err);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
};

// ---------------------------------------------------
// 2. Update Employee (Role, Name, or Salary)
// ---------------------------------------------------
exports.updateEmployee = async (req, res) => {
    const { id } = req.params; // Get ID from the URL
    const { full_name, role, hourly_rate } = req.body; // Get new data from the request

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ full_name, role, hourly_rate })
            .eq('id', id)
            .select(); // Returns the updated row

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee updated successfully', employee: data[0] });
    } catch (err) {
        console.error("Update Employee Error:", err);
        res.status(500).json({ error: 'Failed to update employee' });
    }
};

// ---------------------------------------------------
// 3. Delete Employee
// ---------------------------------------------------
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        // Because we set up "ON DELETE CASCADE" in SQL, deleting the user 
        // from Supabase Auth will automatically delete their profile, tickets, and shifts!
        const { data, error } = await supabase.auth.admin.deleteUser(id);

        if (error) throw error;

        res.status(200).json({ message: 'Employee permanently deleted' });
    } catch (err) {
        console.error("Delete Employee Error:", err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
};