const zone = document.querySelector("#button-zone");
const noBtn = document.querySelector("#no-btn");
const yesBtn = document.querySelector(".btn-yes");

if (zone && noBtn && yesBtn) {
  let lastMoveAt = 0;
  const moveCooldownMs = 120;

  const overlap = (a, b) =>
    !(
      a.right < b.left ||
      a.left > b.right ||
      a.bottom < b.top ||
      a.top > b.bottom
    );

  const moveNoButton = () => {
    const now = Date.now();
    if (now - lastMoveAt < moveCooldownMs) {
      return;
    }

    lastMoveAt = now;
    const zoneRect = zone.getBoundingClientRect();
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    const yesRect = yesBtn.getBoundingClientRect();
    const yesRectInZone = {
      left: yesRect.left - zoneRect.left - 16,
      top: yesRect.top - zoneRect.top - 16,
      right: yesRect.right - zoneRect.left + 16,
      bottom: yesRect.bottom - zoneRect.top + 16,
    };

    const padding = 10;
    const maxLeft = zoneRect.width - btnWidth - padding;
    const maxTop = zoneRect.height - btnHeight - padding;

    let left = padding;
    let top = padding;

    for (let i = 0; i < 40; i += 1) {
      const candidateLeft = padding + Math.random() * Math.max(1, maxLeft - padding);
      const candidateTop = padding + Math.random() * Math.max(1, maxTop - padding);

      const nextRect = {
        left: candidateLeft,
        top: candidateTop,
        right: candidateLeft + btnWidth,
        bottom: candidateTop + btnHeight,
      };

      if (!overlap(nextRect, yesRectInZone)) {
        left = candidateLeft;
        top = candidateTop;
        break;
      }
    }

    noBtn.style.left = `${left}px`;
    noBtn.style.top = `${top}px`;
    noBtn.style.right = "auto";
  };

  const onMouseMove = (event) => {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const rect = noBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    const threshold = Math.max(
      80,
      Math.min(window.innerWidth, window.innerHeight) * 0.14
    );

    if (distance < threshold) {
      moveNoButton();
    }
  };

  const onNoAttempt = (event) => {
    event.preventDefault();
    moveNoButton();
  };

  document.addEventListener("mousemove", onMouseMove);
  noBtn.addEventListener("mouseenter", moveNoButton);
  noBtn.addEventListener("click", onNoAttempt);
  noBtn.addEventListener("touchstart", onNoAttempt, { passive: false });
}
