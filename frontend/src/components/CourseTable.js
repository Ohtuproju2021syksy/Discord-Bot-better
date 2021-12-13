import React from "react";
import { Link } from "react-router-dom";

const CourseTableRow = ({ id, fullName, name, code }) => {
  return (
    <tr>
      <td><Link to={`/courses/${ id }`}>{ fullName }</Link></td>
      <td>{ fullName }</td>
      <td>{ name }</td>
      <td>{ code }</td>
    </tr>
  );
};

const CourseTable = ({ courses }) => {
  return (
    <div id="course_table">
      <h2>Courses</h2>
      <table>
        <thead>
          <tr>
          <th>Course</th>
          <th>Full name</th>
          <th>Nickname</th>
          <th>Course code</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course =>
            <CourseTableRow
              key={course.id}
              id={ course.id }
              fullName={ course.fullName }
              name={ course.name }
              code={ course.code }
            />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;