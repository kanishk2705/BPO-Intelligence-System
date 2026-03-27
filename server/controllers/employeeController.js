const supabase = require('../config/db');

// ---------------------------------------------------
// 1. Get All Employees (NOW WITH PAGINATION)
// ---------------------------------------------------
exports.getAllEmployees = async (req, res) => {
    try {
        // Pagination logic: Default to page 1, 50 items per page
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        // Fetch data AND the exact total count for frontend pagination UI
        const { data, count, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, hourly_rate, created_at', { count: 'exact' })
            .range(start, end)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            data,
            meta: {
                totalCount: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error("Get Employees Error:", err);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
};

// ---------------------------------------------------
// 2. Update Employee (Role, Name, or Salary)
// ---------------------------------------------------
exports.updateEmployee = async (req, res) => {
    const { id } = req.params; 
    const { full_name, role, hourly_rate } = req.body; 

    // SECURITY CHECK: Redundant check in case middleware misses it
    if (!req.profile || req.profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins can modify salaries/roles' });
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ full_name, role, hourly_rate })
            .eq('id', id)
            .select(); 

        if (error) throw error;

        if (!data || data.length === 0) {
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

    // SECURITY CHECK: Ensure only Admins can delete
    if (!req.profile || req.profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins can delete employees' });
    }

    try {
        const { data, error } = await supabase.auth.admin.deleteUser(id);

        if (error) throw error;

        res.status(200).json({ message: 'Employee permanently deleted' });
    } catch (err) {
        console.error("Delete Employee Error:", err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
};