import DepartmentModel from '../../models/Department/department.model.js';
import TeacherUserModel from '../../models/users/TeacherUser.model.js';

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await DepartmentModel.find({})
      .select('name departmentID _id')
      .lean();

    // Sort departments by name
    departments.sort((a, b) => a.name.localeCompare(b.name));
    
    res.status(200).json({
      success: true,
      departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments'
    });
  }
};

// Get teachers by department
export const getTeachersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const teachers = await TeacherUserModel.find({ department: departmentId })
      .select('username email')
      .sort({ username: 1 }) // Sort by name ascending
      .lean();

    res.status(200).json({
      success: true,
      teachers: teachers.map(teacher => ({
        name: teacher.username,
        email: teacher.email,
      }))
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
};