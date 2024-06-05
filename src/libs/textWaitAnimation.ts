let strGlobal = "";

function startAnimation(str = "task") {
  const P = ["󱑖", "󱑍", "󱑐", "󱑓"];
  strGlobal = str;
  let x = 0;
  return setInterval(() => {
    process.stdout.write(`\r${P[x++]}  working: ${str}`);
    if (x >= P.length) x = 0;
  }, 300);
}

function stopAnimation(interval?: NodeJS.Timeout | null) {
  if (!interval) return;

  clearInterval(interval);
  process.stdout.write(`\r  done: ${strGlobal}      \n`);
}

export { startAnimation, stopAnimation };
