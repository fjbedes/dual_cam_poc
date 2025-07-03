let devices = [];
let currentStreams = [null, null];

async function init() {
  try {
    // Request permission first to get device labels
    const initialStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    // Stop the initial stream if you don't want to display it
    initialStream.getTracks().forEach((track) => track.stop());

    await enumerateCameras();
  } catch (err) {
    showError(err);
  }
}

async function enumerateCameras() {
  devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (d) => d.kind === "videoinput"
  );

  const selects = [
    document.getElementById("cameraSelect1"),
    document.getElementById("cameraSelect2"),
  ];

  selects.forEach((select) => {
    select.innerHTML = "";
    devices.forEach((device, idx) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || `Camera ${idx + 1}`;
      select.appendChild(option);
    });
  });

  // Auto start the first device in both slots
  if (devices.length > 0) {
    startStream(0, devices[0].deviceId);
  }
  if (devices.length > 1) {
    startStream(1, devices[1].deviceId);
  }
}

async function startStream(slot, deviceId) {
  try {
    if (currentStreams[slot]) {
      currentStreams[slot].getTracks().forEach((t) => t.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
      audio: false,
    });

    currentStreams[slot] = stream;
    const video = document.getElementById(`video${slot + 1}`);
    video.srcObject = stream;
  } catch (err) {
    showError(err);
  }
}

function showError(err) {
  const msg = document.getElementById("messages");
  msg.innerHTML = `Error: ${err.name} - ${err.message}`;
  console.error(err);
}

document.getElementById("cameraSelect1").addEventListener("change", (e) => {
  startStream(0, e.target.value);
});

document.getElementById("cameraSelect2").addEventListener("change", (e) => {
  startStream(1, e.target.value);
});

// Start on load
init();
