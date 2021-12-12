import React from "react";

const ChannelTableRow = ({ name, bridged, defaultChannel, voiceChannel }) => {
  return (
    <tr>
      <td>{ name }</td>
      <td>{ bridged }</td>
      <td>{ defaultChannel }</td>
      <td>{ voiceChannel }</td>
    </tr>
  );
};

const ChannelTable = ({ channels }) => {
  return (
    <div id="channel_table">
      <h2>Channels</h2>
      <table>
        <thead>
          <tr>
          <th>Name</th>
          <th>Bridged</th>
          <th>Default Channel</th>
          <th>Voice Channel</th>
          </tr>
        </thead>
        <tbody>
          {channels.map(channel =>
            <ChannelTableRow
              key={channel.name}
              bridged={ channel.bridged }
              defaultChannel={ channel.defaultChannel }
              name={ channel.name }
              voiceChannel={ channel.voiceChannel }
            />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChannelTable;