import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Download, Plus, Pencil, Trash2 ,Eye} from 'lucide-react';


const Userlist = ({ isDark, setIsHome,setSelectedStudentId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); 
  const [showApiTimeForm, setShowApiTimeForm] = useState(false); 
  const [apiTimes, setApiTimes] = useState(['02:00']);  
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    handle: '',
  });

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cfHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Slice students for current page
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );
  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students/all_students');
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateStudent = async () => {
    try {
      const payload = {
        name: newStudent.name,
        email: newStudent.email,
        phoneNumber: newStudent.phone,
        cfHandle: newStudent.handle,
      };

      if (editingStudent) {
        // Update existing student
        await axios.put(
          `http://localhost:5000/api/students/update_student/${editingStudent._id}`,
          payload
        );

        // Use updated handle for history fetch
        await axios.post("http://localhost:5000/api/contests/update_contests", {
          studentId: editingStudent._id,
          studentName: payload.name,
          cfHandle: payload.cfHandle,
        });

        await axios.post("http://localhost:5000/api/problems/update_problems", {
          studentId: editingStudent._id,
          studentName: payload.name,
          cfHandle: payload.cfHandle,
        });
        getUnsolvedCount(2113, gyanendra_512);
        alert("Student updated successfully");
      } else {
        // Create new student
        const addRes = await axios.post(
          "http://localhost:5000/api/students/add_student",
          payload
        );
        const createdStudent = addRes.data.student; // Ensure backend returns this

        await axios.post("http://localhost:5000/api/contests/update_contests", {
          studentId: createdStudent._id,
          studentName: createdStudent.name,
          cfHandle: createdStudent.cfHandle,
        });

        await axios.post("http://localhost:5000/api/problems/update_problems", {
          studentId: createdStudent._id,
          studentName: createdStudent.name,
          cfHandle: createdStudent.cfHandle,
        });

        alert("Student added successfully");
      }

      setShowForm(false);
      setEditingStudent(null);
      setNewStudent({ name: "", email: "", phone: "", handle: "" });
      fetchStudents();
    } catch (error) {
      alert("Failed to submit");
      console.error(error);
    }
  };
  

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setNewStudent({
      name: student.name,
      email: student.email,
      phone: student.phoneNumber,
      handle: student.cfHandle,
    });
    setShowForm(true);
  };
  
  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`http://localhost:5000/api/students/delete_student/${id}`);
        fetchStudents();
      } catch (err) {
        alert("Failed to delete student");
      }
    }
  };
  

  const handleDownloadCSV = () => {
    const csvRows = [
      ['Name', 'Email', 'Phone', 'Handle', 'Rating', 'Max Rating'],
      ...students.map(({ name, email, phoneNumber, cfHandle, rating, maxRating }) =>
        [name, email, phoneNumber, cfHandle, rating, maxRating]
      ),
    ];
    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  

  
  
  const bgClass = isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';
  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900';
  const inputClass = isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-black border-gray-300';

  return (
    <div className={`p-6 ${bgClass}`}>
      <h2 className="text-2xl font-bold mb-6">Student Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg shadow ${cardClass}`}>
          <p className="text-sm text-gray-400">Total Students</p>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${cardClass}`}>
          <p className="text-sm text-gray-400">Average Rating</p>
          <p className="text-2xl font-bold">1708</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${cardClass}`}>
          <p className="text-sm text-gray-400">Top Rated Student</p>
          <p className="text-lg font-bold">Charlie Brown</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <input
          type="text"
          placeholder="Search students by name or handle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`px-4 py-2 rounded border ${inputClass} w-full sm:w-1/3`}
        />
        <div className="flex items-center gap-2">
          <button className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded ${isDark
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-400 text-black hover:bg-gray-300'
            }`}
            onClick={() => setShowApiTimeForm(true)}
            // onClickCapture={() => getUnsolvedCount(2118, "HarshRaj29")}
          >
           
            API call times
          </button>

          <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            Add New Student
          </button>
          <button className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded bg-gray-200 hover:bg-gray-300 ${isDark
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-400 text-black hover:bg-gray-300'
            }`}
            onClick={handleDownloadCSV}
          >
            <Download size={16} />
            Download Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg shadow scrollbar-hide">
        <table className={`min-w-full text-sm ${cardClass}`}>
          <thead>
            <tr className="text-left border-b border-gray-500">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Phone Number</th>
              <th className="p-3 font-semibold">Codeforces Handle</th>
              <th className="p-3 font-semibold">Rating</th>
              <th className="p-3 font-semibold">Max Rating</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((user, index) => (
              <tr key={index} className={`border-t border-gray-700 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phoneNumber}</td>
                <td className="p-3 text-blue-500">{user.cfHandle}</td>
                <td className="p-3 font-semibold">{user.rating}</td>
                <td className="p-3 font-semibold">{user.maxRating}</td>
                <td className="p-3 flex gap-2 flex-wrap">
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 min-w-[90px] rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      setSelectedStudentId(user._id);
                      setIsHome(false);
                    }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 min-w-[90px] rounded text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600"
                   onClick={() => handleEditStudent(user)}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 min-w-[90px] rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                    onClick={() => handleDeleteStudent(user._id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <nav className="flex gap-2 items-center text-sm">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-400 text-black hover:bg-gray-300'
              }`}
          >
            &lt; Previous
          </button>

          {/* Optional: Display Current Page Info */}
          <span className="px-2">{currentPage}</span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-400 text-black hover:bg-gray-300'
              }`}
          >
            Next &gt;
          </button>
        </nav>
      </div>


      
      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-full max-w-md ${cardClass}`}>
            <h3 className="text-xl font-bold mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h3>
            {['name', 'email', 'phone', 'handle'].map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                value={newStudent[field]}
                onChange={handleInputChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={`w-full mb-2 px-4 py-2 rounded border ${inputClass}`}
              />
            ))}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-500 text-white" onClick={() => {
                setShowForm(false);
                setEditingStudent(null);
              }}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleAddOrUpdateStudent}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showApiTimeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-full max-w-md ${cardClass}`}>
            <h3 className="text-xl font-bold mb-4">Set API Call Times</h3>

            {apiTimes.length === 0 && (
              <p className="text-gray-400 mb-2 text-sm">No times added. Click "Add Time" to begin.</p>
            )}

            {apiTimes.map((time, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="time"
                  value={time}
                  className="w-full px-4 py-2 rounded border border-gray-400"
                  onChange={(e) => {
                    const newTimes = [...apiTimes];
                    newTimes[idx] = e.target.value;
                    setApiTimes(newTimes);
                  }}
                />
                <button
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={() => {
                    const updated = apiTimes.filter((_, i) => i !== idx);
                    setApiTimes(updated);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              className="mb-4 px-3 py-1 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              onClick={() => setApiTimes([...apiTimes, '00:00'])}
            >
              + Add Time
            </button>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-500 text-white"
                onClick={() => {
                  setShowApiTimeForm(false);
                  setApiTimes([]); // optional: clear on cancel
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  alert(`✅ Times saved: ${apiTimes.join(', ')}`);
                  setShowApiTimeForm(false);
                  // TODO: POST apiTimes to backend
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Userlist;
