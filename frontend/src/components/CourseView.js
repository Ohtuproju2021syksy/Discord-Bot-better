import React from "react";
import channelService from "../services/channelService";
import ChannelTable from "./ChannelTable";
import { useParams } from "react-router-dom";

const CourseView = ({ courses, channels }) => {
  const id = useParams().id;
  const course = courses.find(c => c.id === Number(id));

  if (!course) {
    return null;
  }

  const courseChannels = channels.filter(ch => ch.courseId === course.id);

  return (
    <div id="course_view">
      <h1>{ course.fullName }</h1>
      <ChannelTable channels={ courseChannels } />
    </div>
  );
};

export default CourseView;