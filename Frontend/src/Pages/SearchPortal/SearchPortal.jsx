import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Alert, AlertDescription } from "@/Components/ui/alert";

const departments = [
  "Biotechnology",
  "Chemistry",
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Humanities and Management",
  "Industrial and Production Engineering",
  "Information Technology",
  "Instrumentation and Control Engineering",
  "Mathematics and Computing",
  "Mechanical Engineering",
  "Physics",
  "Textile Technology",
];

const generateTeachers = (dept) => {
  const deptCode = dept.split(" ")[0].toLowerCase();
  const teachers = [
    {
      name: "Chahat Kesharwani",
      email: "chahatk.ic.23@nitj.ac.in",
    },
  ];

  const firstNames = ["Amit", "Priya", "Rahul", "Neha", "Vikram", "Sneha"];
  const lastNames = ["Kumar", "Sharma", "Singh", "Gupta", "Verma", "Patel"];

  for (let i = 0; i < 6; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const shortName = (
      firstName.slice(0, 3) + lastName.slice(0, 1)
    ).toLowerCase();
    teachers.push({
      name: `${firstName} ${lastName}`,
      email: `${shortName}.${deptCode}.23@nitj.ac.in`,
    });
  }

  return teachers;
};

const SearchPortal = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [deptSearch, setDeptSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    if (selectedDept) {
      setTeachers(generateTeachers(selectedDept));
      setTeacherSearch("");
      setSelectedTeacher(null);
    }
  }, [selectedDept]);

  const filteredDepts = departments.filter((dept) =>
    dept.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.email.toLowerCase().includes(teacherSearch.toLowerCase())
  );

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
    }
  };

  const generateShareableLink = () => {
    if (!selectedTeacher) return "";
    const initials = getTeacherInitials(selectedTeacher.email);
    return `${window.location.origin}/${initials}/Sharedfiles`;
  };

  const handleVisitFiles = () => {
    const route = `/${getTeacherInitials(selectedTeacher.email)}/Sharedfiles`;
    window.open(route, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Panel - Selection */}
      <div
        className={`w-full lg:w-1/2 p-4 lg:p-8 ${
          showMobilePreview ? "hidden lg:block" : ""
        }`}>
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
                aria-label="Search departments"
              />
            </div>
            <div className="max-h-48 overflow-auto border rounded-lg bg-white shadow-sm">
              {filteredDepts.length > 0 ? (
                filteredDepts.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDept(dept);
                      setDeptSearch("");
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                      selectedDept === dept ? "bg-gray-50 text-blue-600" : ""
                    }`}>
                    <span>{dept}</span>
                    {selectedDept === dept && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-gray-500 text-center">
                  No departments found
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
                placeholder={
                  selectedDept
                    ? "Search teachers..."
                    : "Select a department first"
                }
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="pl-10 mb-2 bg-white"
                disabled={!selectedDept}
                aria-label="Search teachers"
              />
            </div>
            <div className="max-h-48 overflow-auto border rounded-lg bg-white shadow-sm">
              {selectedDept ? (
                filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <button
                      key={teacher.email}
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setTeacherSearch("");
                        setShowMobilePreview(true);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                        selectedTeacher?.email === teacher.email
                          ? "bg-gray-50"
                          : ""
                      }`}>
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
                    No teachers found
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
                onClick={() => setShowMobilePreview(true)}>
                View Preview
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div
        className={`w-full lg:w-1/2 ${
          !showMobilePreview && "hidden lg:block"
        }`}>
        {selectedTeacher ? (
          <div className="h-full flex flex-col">
            {/* Mobile Back Button - Enhanced */}
            <div className="lg:hidden sticky top-0 z-10 bg-white border-b">
              <Button
                variant="ghost"
                className="m-4 flex items-center text-gray-600"
                onClick={() => setShowMobilePreview(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </div>

            {/* Top Section with Card - Mobile Optimized */}
            <div className="p-4 lg:p-8">
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="px-4 py-3 border-b">
                  <CardTitle className="text-lg font-medium">
                    Generated Link Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Teacher Info - Mobile Optimized */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                          Department
                        </span>
                        <span className="font-medium">{selectedDept}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Teacher</span>
                        <span className="font-medium">
                          {selectedTeacher.name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="font-medium break-all">
                          {selectedTeacher.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Link Section - Mobile Optimized */}
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
                        className="shrink-0">
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {copied && (
                      <Alert className="bg-green-50 border-green-100 py-2">
                        <AlertDescription className="text-green-800 text-sm">
                          Link copied to clipboard!
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleVisitFiles}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Shared Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section with Preview - Mobile Optimized */}
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
                      src={`/${getTeacherInitials(
                        selectedTeacher.email
                      )}/Sharedfiles`}
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
