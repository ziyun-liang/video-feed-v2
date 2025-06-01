const videoFeedData = [
  {
    videoSrc: "video1.mp4",
    title: "May 28, 2025",
    description: "Joël Le Scouarnec, a former surgeon in France, confessed to abusing at least 299 people, mostly children, and was sentenced to 20 years in prison.",
    isAd: false
  },
  {
    videoSrc: "video2.mp4",
    title: "May 28, 2025",
    description: "McCormick Place, a convention center in Chicago, went from being a killer of migratory birds to a success story.",
    isAd: false
  },
  {
    videoSrc: "video3.mp4",
    title: "May 28, 2025",
    description: "The latest flight of SpaceX's Starship, the largest and most powerful rocket ever built, got all the way up to space, but not all the way back down to Earth.",
    isAd: false
  },
  {
    videoSrc: "video4.mp4",
    title: "May 28, 2025",
    description: "China and US tariff war",
    isAd: false
  },
  {
    videoSrc: "video5.mp4",
    title: "May 27, 2025",
    description: "Here are four summer books our editors are looking forward to.",
    isAd: false
  },
  {
    videoSrc: "ad.mp4",
    adMessage: "That's his name: Stitch! 💙 Lilo And Stitch is now playing in theaters!",
    adLogo: "disney-logo.png",
    adLabel: "AD",
    adNextThumbnail: "next-thumbnail.jpg",
    adNextTitle: "The U-Shaped Curve of Happiness",
    isAd: true
  },
  {
    videoSrc: "video6.mp4",
    title: "May 23, 2025",
    description: "For decades, research showed that the way people experienced happiness across their lifetimes looked like a U-shaped curve: Happiness tended to be high when they were young, then dipped in midlife, only to rise again as they grew old.",
    isAd: false
  },
  {
    videoSrc: "video7.mp4",
    title: "May 26, 2025",
    description: "As President Trump blurs the lines between politics and business, and threatens steep tariffs, governments feel compelled to favor Trump-related projects.",
    isAd: false
  },
  {
    videoSrc: "video8.mp4",
    title: "May 25, 2025",
    description: "Donald Trump has reordered America's political divide both geographically and demographically.",
    isAd: false
  },
  {
    videoSrc: "video9.mp4",
    title: "May 23, 2025",
    description: "Jeff Goldblum's new album features his 'Wicked' co-stars Ariana Grande and Cynthia Erivo.",
    isAd: false
  },
  {
    videoSrc: "video10.mp4",
    title: "May 22, 2025",
    description: "For years, Russia used Brazil as a launchpad for its most elite intelligence officers.",
    isAd: false
  }
];

function renderVideoFeed() {
  const feed = document.getElementById('videoFeed');
  feed.innerHTML = videoFeedData.map((item, idx) => {
    const playOverlay = `
      <div class="video-play-overlay hidden">
        <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="36" cy="36" r="36" fill="#000" fill-opacity="0.18"/>
          <g transform="translate(26, 20)">
            <path d="M27 14.2679C28.3333 15.0377 28.3333 16.9623 27 17.7321L3 31.5885C1.66667 32.3583 -1.54721e-06 31.396 -1.47991e-06 29.8564L-2.68545e-07 2.14359C-2.01247e-07 0.603992 1.66667 -0.35826 3 0.411541L27 14.2679Z" fill="#fff" fill-opacity="0.5"/>
          </g>
        </svg>
      </div>
    `;
    if (item.isAd) {
      return `
        <div class="video-container ad-video hidden-on-load">
          <video data-src="${item.videoSrc}" loop muted playsinline preload="metadata"></video>
          ${playOverlay}
          <button class="sound-toggle" aria-label="Toggle sound">
            <span class="icon-muted"></span>
          </button>
          <div class="ad-countdown"></div>
          <div class="video-info ad-info">
            <div class="ad-label">AD</div>
            <img class="ad-logo" src="${item.adLogo}" alt="Disney Logo" />
            <p>${item.adMessage}</p>
            <div class="ad-divider"></div>
            <div class="ad-skip-modal">
              <span class="ad-skip-countdown">Skip in 5</span>
              <span class="ad-next-group">
                <img class="ad-next-thumbnail" src="${item.adNextThumbnail}" alt="Next video thumbnail" />
                <span class="ad-next-title">${item.adNextTitle}</span>
              </span>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="video-container">
          <video data-src="${item.videoSrc}" loop muted playsinline preload="metadata"></video>
          ${playOverlay}
          <button class="sound-toggle" aria-label="Toggle sound">
            <span class="icon-muted"></span>
          </button>
          <div class="video-info">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </div>
      `;
    }
  }).join('');
}

// Lazy load videos using Intersection Observer
function setupVideoLazyLoading() {
  const videos = document.querySelectorAll('video[data-src]');
  const config = {
    root: null,
    rootMargin: '200px',
    threshold: 0.01
  };
  const onIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        if (!video.src) {
          video.src = video.getAttribute('data-src');
          // Always try to play if in view, no bounding box check
          video.play().catch(() => {});
        }
        observer.unobserve(video);
      }
    });
  };
  const observer = new IntersectionObserver(onIntersection, config);
  videos.forEach(video => observer.observe(video));
}

document.addEventListener('DOMContentLoaded', () => {
  renderVideoFeed();

  // Eagerly load the first video for immediate display
  const firstVideo = document.querySelector('video[data-src]');
  if (firstVideo && !firstVideo.src) {
    firstVideo.src = firstVideo.getAttribute('data-src');
  }

  setupVideoLazyLoading();

  // Now query containers and set up all logic
  const containers = Array.from(document.querySelectorAll('.video-container'));
  const adContainer = document.querySelector('.ad-video');
  const adIndex = containers.indexOf(adContainer);
  let currentIndex = 0;
  let isAnimating = false;
  let adLock = false;
  let adCountdownTimer = null;
  let adLockShown = false;
  let adHoldTriggered = false;
  let globalMuted = true;
  const allVideos = containers.map(c => c.querySelector('video'));
  const allIcons = Array.from(document.querySelectorAll('.sound-toggle span'));
  let adHasBeenShown = false;

  // Prevent browser from restoring scroll position
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);

  // Always start on the first video
  function setToFirstVideo() {
    currentIndex = 0;
    containers.forEach((c, i) => {
      c.style.transform = `translateY(${(i - currentIndex) * 100}%)`;
    });
    if (currentIndex === adIndex) {
      lockAdSwipe();
    } else {
      unlockAdSwipe();
    }
  }
  function forceFirstVideo() {
    window.scrollTo(0, 0);
    setToFirstVideo();
  }
  // On DOMContentLoaded and pageshow, repeatedly reset for 500ms
  function robustFirstVideoReset() {
    let tries = 0;
    const maxTries = 10;
    function tryReset() {
      forceFirstVideo();
      tries++;
      if (tries < maxTries) {
        setTimeout(tryReset, 50);
      } else {
        // Reveal all videos after reset
        containers.forEach(c => c.classList.remove('hidden-on-load'));
        // Immediately check if ad is in view after reveal
        const adRect = adContainer.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (
          adRect.top < vh * 0.3 && // at least 30% of ad is visible
          adRect.bottom > vh * 0.3 &&
          !adHoldTriggered
        ) {
          lockAdSwipe();
          adHoldTriggered = true;
        }
        // After reveal, if ad is the current video, trigger ad-hold
        if (currentIndex === adIndex && !adHoldTriggered) {
          lockAdSwipe();
          adHoldTriggered = true;
        }
      }
    }
    tryReset();
  }
  document.addEventListener('DOMContentLoaded', robustFirstVideoReset);
  window.addEventListener('pageshow', robustFirstVideoReset);

  // Set up absolute positioning for all containers
  containers.forEach((c, i) => {
    c.style.position = 'absolute';
    c.style.top = '0';
    c.style.left = '0';
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    c.style.transform = `translateY(${i * 100}%)`;
    c.style.zIndex = containers.length - i;
  });

  // Paging swipe logic
  let touchStartY = 0;
  let touchMoved = false;
  let gestureHandled = false;

  document.body.addEventListener('touchstart', (e) => {
    if (isAnimating) return;
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
    gestureHandled = false;
  }, { passive: true });

  document.body.addEventListener('touchmove', (e) => {
    if (isAnimating) return;
    touchMoved = true;
  }, { passive: true });

  document.body.addEventListener('touchend', (e) => {
    if (isAnimating || gestureHandled) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    // If on ad video and adLock is true, block all swipes and trigger glow
    if (currentIndex === adIndex && adLock) {
      triggerAdSkipGlow();
      isAnimating = false;
      touchMoved = false;
      gestureHandled = true;
      e.stopPropagation && e.stopPropagation();
      e.preventDefault && e.preventDefault();
      return;
    }
    // Only handle swipe navigation here
    if (Math.abs(diff) > 40) {
      isAnimating = true;
      if (diff > 0 && currentIndex < containers.length - 1) {
        goToIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        goToIndex(currentIndex - 1);
      } else {
        isAnimating = false;
      }
      gestureHandled = true;
      return;
    }
    touchMoved = false;
    gestureHandled = true;
  }, { passive: false });

  // Mouse wheel support for desktop testing
  let wheelTimeout = null;
  document.body.addEventListener('wheel', (e) => {
    if (isAnimating) return;
    if (adLock && currentIndex === adIndex) {
      triggerAdSkipGlow();
      e.preventDefault();
      return;
    }
    clearTimeout(wheelTimeout);
    isAnimating = true;
    if (e.deltaY > 30 && currentIndex < containers.length - 1) {
      goToIndex(currentIndex + 1);
    } else if (e.deltaY < -30 && currentIndex > 0) {
      goToIndex(currentIndex - 1);
    } else {
      isAnimating = false;
    }
    wheelTimeout = setTimeout(() => {
      isAnimating = false;
    }, 400);
  });

  function goToIndex(index) {
    // If on ad and adLock is true, block all transitions
    if (currentIndex === adIndex && adLock) {
      isAnimating = false;
      return;
    }
    // Only allow one video per gesture
    if (Math.abs(index - currentIndex) > 1) {
      index = currentIndex + (index > currentIndex ? 1 : -1);
    }
    // Always allow scrolling back to previous videos
    if (index < currentIndex) {
      currentIndex = index;
      containers.forEach((c, i) => {
        c.style.transform = `translateY(${(i - currentIndex) * 100}%)`;
      });
      setTimeout(() => {
        isAnimating = false;
      }, 400);
      // If landing on ad video, trigger ad-hold if not already triggered (force for desktop)
      if (currentIndex === adIndex && !adHoldTriggered) {
        lockAdSwipe();
        adHoldTriggered = true;
      } else if (currentIndex === adIndex) {
        unlockAdSwipe();
      } else {
        unlockAdSwipe();
      }
      return;
    }
    // Forwards navigation
    currentIndex = index;
    containers.forEach((c, i) => {
      c.style.transform = `translateY(${(i - currentIndex) * 100}%)`;
    });
    setTimeout(() => {
      isAnimating = false;
    }, 400);
    // If landing on ad video, trigger ad-hold if not already triggered (force for desktop)
    if (currentIndex === adIndex && !adHoldTriggered) {
      lockAdSwipe();
      adHoldTriggered = true;
    } else if (currentIndex === adIndex) {
      unlockAdSwipe();
    } else {
      unlockAdSwipe();
    }
  }

  // Ad lock logic
  function lockAdSwipe() {
    adLock = true;
    // If ad has been shown before, hide divider and modal, skip 5s logic
    if (adHasBeenShown) {
      // Hide divider and modal every time
      const divider = adContainer.querySelector('.ad-divider');
      if (divider) divider.style.display = 'none';
      const skipModal = adContainer.querySelector('.ad-skip-modal');
      if (skipModal) skipModal.style.display = 'none';
      // Also hide old ad-countdown pill
      const countdownDiv = adContainer.querySelector('.ad-countdown');
      if (countdownDiv) countdownDiv.style.display = 'none';
      adLock = false;
      return;
    }
    adHasBeenShown = true;
    // Hide old ad-countdown pill
    const countdownDiv = adContainer.querySelector('.ad-countdown');
    countdownDiv.style.display = 'none';
    // Show divider and modal
    const divider = adContainer.querySelector('.ad-divider');
    if (divider) divider.style.display = 'block';
    const skipModal = adContainer.querySelector('.ad-skip-modal');
    const skipCountdown = skipModal.querySelector('.ad-skip-countdown');
    skipModal.classList.remove('active');
    skipModal.style.display = 'flex';
    let seconds = 5;
    skipCountdown.textContent = `Skip in ${seconds}`;
    if (adCountdownTimer) clearInterval(adCountdownTimer);
    adCountdownTimer = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        skipCountdown.textContent = `Skip in ${seconds}`;
        skipModal.classList.remove('active');
      } else {
        skipCountdown.textContent = 'Skip ↑';
        skipModal.classList.add('active');
        adLock = false;
        clearInterval(adCountdownTimer);
      }
    }, 1000);
    // Click handler for skip modal
    skipModal.onclick = function() {
      if (skipModal.classList.contains('active')) {
        goToIndex(adIndex + 1);
      }
    };
  }
  function unlockAdSwipe() {
    adLock = false;
    // Hide both countdown and modal
    const countdownDiv = adContainer.querySelector('.ad-countdown');
    countdownDiv.style.display = 'none';
    const skipModal = adContainer.querySelector('.ad-skip-modal');
    skipModal.style.display = 'none';
    // Always hide divider if adHasBeenShown
    const divider = adContainer.querySelector('.ad-divider');
    if (adHasBeenShown && divider) divider.style.display = 'none';
    if (adCountdownTimer) clearInterval(adCountdownTimer);
  }

  // Sound toggle logic
  function updateAllIconsAndVideos() {
    allVideos.forEach(video => {
      video.muted = globalMuted;
    });
    allIcons.forEach(icon => {
      icon.classList.remove('icon-muted', 'icon-sound');
      if (globalMuted) {
        icon.classList.add('icon-muted');
      } else {
        icon.classList.add('icon-sound');
      }
    });
  }

  document.querySelectorAll('.sound-toggle').forEach((btn, idx) => {
    // Set initial icon state globally
    updateAllIconsAndVideos();
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      globalMuted = !globalMuted;
      updateAllIconsAndVideos();
    });
  });

  // --- Tap-to-pause/resume logic (from v3, with countdown resume for ad) ---
  const manualPauseMap = new WeakMap();
  let pausedAdCountdownSeconds = null;
  function handleTapPause(e) {
    if (!e.currentTarget) return;
    // Prevent tap-to-pause during adLock on ad
    if (adLock && currentIndex === adIndex) return;
    if (e.type === 'click' && 'ontouchstart' in window) {
      return;
    }
    if (e.type === 'click' && e.button !== undefined && e.button !== 0) return;
    const container = e.currentTarget;
    const video = container.querySelector('video');
    const playOverlay = container.querySelector('.video-play-overlay');
    if (e.target.closest('.sound-toggle') || e.target.closest('.ad-skip-modal')) {
      return;
    }
    const isPausedByTap = manualPauseMap.get(video) || false;
    if (!isPausedByTap) {
      manualPauseMap.set(video, true);
      video.pause();
      if (playOverlay) playOverlay.classList.remove('hidden');
      // --- Ad countdown pause logic ---
      if (currentIndex === adIndex && adLock) {
        if (adCountdownTimer) {
          // Save remaining seconds from skipCountdown text
          const skipModal = adContainer.querySelector('.ad-skip-modal');
          const skipCountdown = skipModal.querySelector('.ad-skip-countdown');
          const match = skipCountdown.textContent.match(/(\d+)/);
          if (match) {
            pausedAdCountdownSeconds = parseInt(match[1], 10);
          } else {
            pausedAdCountdownSeconds = null;
          }
          clearInterval(adCountdownTimer);
          adCountdownTimer = null;
        }
      }
      if (e.type === 'touchend') e.preventDefault();
    } else {
      manualPauseMap.set(video, false);
      video.play().catch(() => {});
      if (playOverlay) playOverlay.classList.add('hidden');
      // --- Ad countdown resume logic ---
      if (currentIndex === adIndex && adLock) {
        if (!adCountdownTimer && pausedAdCountdownSeconds && pausedAdCountdownSeconds > 0) {
          const skipModal = adContainer.querySelector('.ad-skip-modal');
          const skipCountdown = skipModal.querySelector('.ad-skip-countdown');
          let seconds = pausedAdCountdownSeconds;
          skipCountdown.textContent = `Skip in ${seconds}`;
          adCountdownTimer = setInterval(() => {
            seconds--;
            if (seconds > 0) {
              skipCountdown.textContent = `Skip in ${seconds}`;
              skipModal.classList.remove('active');
            } else {
              skipCountdown.textContent = 'Skip ↑';
              skipModal.classList.add('active');
              adLock = false;
              clearInterval(adCountdownTimer);
            }
          }, 1000);
          pausedAdCountdownSeconds = null;
        }
      }
      if (e.type === 'touchend') e.preventDefault();
    }
  }
  // Attach to each .video-container instead of <video>
  containers.forEach(container => {
    container.addEventListener('click', handleTapPause);
    container.addEventListener('touchend', handleTapPause);
  });
  // Update observer to respect manualPauseMap and always play when in view
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const isPausedByTap = manualPauseMap.get(video) || false;
      // Find the overlay in the container
      const container = video.closest('.video-container');
      const playOverlay = container ? container.querySelector('.video-play-overlay') : null;
      if (entry.isIntersecting) {
        if (!isPausedByTap) {
          video.play().catch(() => {});
          if (playOverlay) playOverlay.classList.add('hidden');
        }
      } else {
        video.pause();
      }
    });
  }, {
    threshold: 0.7
  });
  containers.forEach(container => {
    const video = container.querySelector('video');
    observer.observe(video);
  });

  // Intersection Observer for ad-hold (first time ad is in view)
  const adObserver = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !adHoldTriggered) {
        lockAdSwipe();
        adHoldTriggered = true;
      }
    });
  }, {
    threshold: 0.7
  });
  adObserver.observe(adContainer);

  // If starting on ad video, lock swipe
  if (currentIndex === adIndex) {
    lockAdSwipe();
  }

  function triggerAdSkipGlow() {
    if (!adLock || currentIndex !== adIndex) return;
    const skipModal = adContainer.querySelector('.ad-skip-modal');
    if (skipModal) {
      skipModal.classList.add('ad-skip-glow');
      setTimeout(() => {
        skipModal.classList.remove('ad-skip-glow');
      }, 700);
    }
  }
}); 