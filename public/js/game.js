const socket = io();

const { userName, roomName, boxes } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
