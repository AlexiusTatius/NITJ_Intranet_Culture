import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, ArrowLeft, Loader, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiTeacherInstance } from "../../Helper/axiosInstance";

const SearchPortal = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deptSearch, setDeptSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Loading states
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Error states
  const [deptError, setDeptError] = useState(null);
  const [teacherError, setTeacherError] = useState(null);
  const [linkError, setLinkError] = useState(null);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDeptError(null);
        const response = await apiTeacherInstance.get('/file-folder/departments');
        if (response.data.success) {
          setDepartments(response.data.departments);
        } else {
          throw new Error(response.data.message || 'Failed to fetch departments');
        }
      } catch (err) {
        setDeptError(err.response?.data?.message || 'Failed to load departments. Please try again.');
        console.error('Department fetch error:', err);
      } finally {
        setIsLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch teachers when department is selected
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!selectedDept) {
        setTeachers([]);
        return;
      }

      setIsLoadingTeachers(true);
      try {
        setTeacherError(null);
        const response = await apiTeacherInstance.get(`/file-folder/teachers/${selectedDept._id}`);
        if (response.data.success) {
          setTeachers(response.data.teachers);
        } else {
          throw new Error(response.data.message || 'Failed to fetch teachers');
        }
      } catch (err) {
        setTeacherError(err.response?.data?.message || 'Failed to load teachers. Please try again.');
        console.error('Teacher fetch error:', err);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [selectedDept]);

  // Filter functions
  const filteredDepts = departments.filter((dept) =>
    dept.name.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    teacher.email.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  // Helper functions
  const getTeacherInitials = (email) => {
    return email.split("@")[0];
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setLinkError('Failed to copy to clipboard');
    }
  };

  const generateShareableLink = () => {
    if (!selectedTeacher) return "";
    const initials = getTeacherInitials(selectedTeacher.email);
    return `${window.location.origin}/${initials}/Sharedfiles`;
  };

  const handleVisitFiles = () => {
    if (!selectedTeacher) return;
    const route = `/${getTeacherInitials(selectedTeacher.email)}/Sharedfiles`;
    window.open(route, "_blank");
  };

  const handleDepartmentSelect = (dept) => {
    setSelectedDept(dept);
    setSelectedTeacher(null);
    setTeacherSearch("");
    setTeacherError(null);
  };

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setShowMobilePreview(true);
    setLinkError(null);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Panel - Selection */}
      <div className={`w-full lg:w-1/2 p-4 lg:p-8 ${showMobilePreview ? "hidden lg:block" : ""}`}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-gray-600" />
            Search Portal
          </h2>

          {/* Department Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search departments..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="pl-10 mb-2 bg-white"
                disabled={isLoadingDepts}
                aria-label="Search departments"
              />
            </div>

            {deptError && (
              <Alert className="mb-2" variant="destructive">
                <AlertDescription>{deptError}</AlertDescription>
              </Alert>
            )}

            <div className="max-h-48 overflow-auto border rounded-lg bg-white shadow-sm">
              {isLoadingDepts ? (
                <div className="flex justify-center items-center h-20">
                  <Loader className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : filteredDepts.length > 0 ? (
                filteredDepts.map((dept) => (
                  <button
                    key={dept._id}
                    onClick={() => handleDepartmentSelect(dept)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                      selectedDept?._id === dept._id ? "bg-gray-50 text-blue-600" : ""
                    }`}
                  >
                    <span>{dept.name}</span>
                    {selectedDept?._id === dept._id && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-gray-500 text-center">
                  {deptSearch ? "No departments found" : "No departments available"}
                </div>
              )}
            </div>
          </div>

          {/* Teacher Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder={selectedDept ? "Search teachers..." : "Select a department first"}
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="pl-10 mb-2 bg-white"
                disabled={!selectedDept || isLoadingTeachers}
                aria-label="Search teachers"
              />
            </div>

            {teacherError && (
              <Alert className="mb-2" variant="destructive">
                <AlertDescription>{teacherError}</AlertDescription>
              </Alert>
            )}

            <div className="max-h-48 overflow-auto border rounded-lg bg-white shadow-sm">
              {isLoadingTeachers ? (
                <div className="flex justify-center items-center h-20">
                  <Loader className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : selectedDept ? (
                filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <button
                      key={teacher.email}
                      onClick={() => handleTeacherSelect(teacher)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                        selectedTeacher?.email === teacher.email ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {teacher.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {teacher.email}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-gray-500 text-center">
                    {teacherSearch ? "No teachers found" : "No teachers available"}
                  </div>
                )
              ) : (
                <div className="p-4 text-gray-500 text-center">
                  Select a department to view teachers
                </div>
              )}
            </div>
          </div>

          {/* Mobile Preview Toggle */}
          {selectedTeacher && (
            <div className="lg:hidden">
              <Button
                className="w-full mb-4"
                onClick={() => setShowMobilePreview(true)}
              >
                View Preview
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className={`w-full lg:w-1/2 ${!showMobilePreview && "hidden lg:block"}`}>
        {selectedTeacher ? (
          <div className="h-full flex flex-col">
            {/* Mobile Back Button */}
            <div className="lg:hidden sticky top-0 z-10 bg-white border-b">
              <Button
                variant="ghost"
                className="m-4 flex items-center text-gray-600"
                onClick={() => setShowMobilePreview(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </div>

            {/* Preview Content */}
            <div className="p-4 lg:p-8">
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="px-4 py-3 border-b">
                  <CardTitle className="text-lg font-medium">
                    Generated Link Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Teacher Info */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Department</span>
                        <span className="font-medium">{selectedDept.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Teacher</span>
                        <span className="font-medium">{selectedTeacher.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="font-medium break-all">
                          {selectedTeacher.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Link Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        readOnly
                        value={generateShareableLink()}
                        className="flex-1 text-sm bg-gray-50"
                      />
                      <Button
                        onClick={() => handleCopy(generateShareableLink())}
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {linkError && (
                      <Alert className="bg-red-50 border-red-100">
                        <AlertDescription className="text-red-800 text-sm">
                          {linkError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {copied && (
                      <Alert className="bg-green-50 border-green-100">
                        <AlertDescription className="text-green-800 text-sm">
                          Link copied to clipboard!
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleVisitFiles}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Shared Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page Preview Section */}
            <div className="flex-1 p-4 lg:p-8 pt-0">
              <Card className="h-full shadow-sm border-0">
                <CardHeader className="px-4 py-3 border-b">
                  <CardTitle className="text-lg font-medium">
                    Page Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100vh-24rem)] lg:h-[calc(100%-4rem)]">
                  <div className="w-full h-full bg-white relative">
                  <iframe
                        src={`/${getTeacherInitials(selectedTeacher.email)}/Sharedfiles`}
                        className="w-full h-full absolute inset-0"
                        title="Page Preview"
                        style={{ maxHeight: "calc(100vh - 24rem)" }}
                      />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Search className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">
                Select a department and teacher to generate the preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPortal;