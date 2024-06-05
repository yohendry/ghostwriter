export function getPerformanceDuration(section = "general") {
  const performaceStatus = performance.measure(
    "duration",
    `${section}-started`,
    `${section}-finished`,
  );
  return performaceStatus.duration;
}
