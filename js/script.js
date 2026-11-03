const scenes = [
  { file: "videos/morning1.mp4", end: 4.70, name: "Morning Scene 1" },
  { file: "videos/morning2.mp4", end: 6.80, name: "Morning Scene 2" },
  { file: "videos/morning3.mp4", end: 9.43, name: "Morning Scene 3" },
  { file: "videos/morning4.mp4", end: 30.15, name: "Morning Scene 4" },
  { file: "videos/night1.mp4", end: 41.92, name: "Night Scene 1" },
  { file: "videos/night2.mp4", end: 72.63, name: "Night Scene 2" }
];

const video = document.getElementById("sceneVideo");
const audio = document.getElementById("soundtrack");
const fullBtn = document.getElementById("fullBtn");
const sceneNumber = document.getElementById("sceneNumber");
const sceneName = document.getElementById("sceneName");
const timeOfDay = document.getElementById("timeOfDay");
const statusText = document.getElementById("statusText");
const progressBar = document.getElementById("progressBar");

let currentScene = -1;

// Change the video
function showScene(index) {
  if (index === currentScene) return;

  currentScene = index;
  const scene = scenes[index];

  // Night1
  video.classList.toggle("portrait-video", index === 4);

  // Change
  document.body.classList.toggle("night", index >= 4);
  timeOfDay.textContent = index >= 4
    ? "02 — NIGHT"
    : "01 — MORNING";

  video.src = scene.file;
  video.load();

  video.classList.remove("switching");
  void video.offsetWidth;
  video.classList.add("switching");

  sceneNumber.textContent = "SCENE 0" + (index + 1) + " / 06";
  sceneName.textContent = scene.name;

  if (!audio.paused) {
    video.play().catch(() => {});
  }
}

function syncVideo() {
  const time = audio.currentTime;

  let index = scenes.findIndex(scene => time < scene.end);
  if (index === -1) index = scenes.length - 1;

  showScene(index);

  const start = index === 0 ? 0 : scenes[index - 1].end;
  const sceneLength = scenes[index].end - start;

  if (video.readyState >= 1 && video.duration > 0) {
    const speed = video.duration / sceneLength;
    video.playbackRate = speed;

    const targetTime = Math.min(
      video.duration - 0.05,
      Math.max(0, (time - start) * speed)
    );

    if (Math.abs(video.currentTime - targetTime) > 0.35) {
      video.currentTime = targetTime;
    }
  }

  if (audio.duration > 0) {
    progressBar.style.width =
      (time / audio.duration * 100) + "%";
  }
}

// Full Journey button
fullBtn.addEventListener("click", () => {
  audio.pause();
  video.pause();
  audio.currentTime = 0;
  syncVideo();
  audio.play().catch(() => {
    statusText.textContent = "Press play to begin.";
  });
});

// Play
audio.addEventListener("play", () => {
  document.body.classList.add("playing");
  fullBtn.classList.add("active");
  statusText.textContent = "Now playing...";
  syncVideo();
  video.play().catch(() => {});
});

// Pause
audio.addEventListener("pause", () => {
  document.body.classList.remove("playing");
  video.pause();

  if (!audio.ended) {
    statusText.textContent = "Paused.";
  }
});

// Update
audio.addEventListener("timeupdate", syncVideo);
audio.addEventListener("seeked", syncVideo);
video.addEventListener("loadedmetadata", syncVideo);

// End
audio.addEventListener("ended", () => {
  video.pause();
  document.body.classList.remove("playing");
  fullBtn.classList.remove("active");
  progressBar.style.width = "100%";
  statusText.textContent = "Journey complete.";
});

showScene(0);
