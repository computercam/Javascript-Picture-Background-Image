// Takes a picture element and uses it to create a responsive background image using the background-image css property

// Additionally you can also set background properties (or other properties) using the backgroundProperties argument
// - The bgProps argument should be an object with 
//   properties that are of the same name as properties on the style object of a dom element.
//   ie: backgroundPosition, backgroundRepeat

export default function(el, bgProps) {
  const pictureEl = getPictureEl(el);
  
  if (!pictureEl) {
    console.warn('picture-background-image', 'Supplied argument "el" is not a Picture Element.');
    return;
  }

  setPictureElHidden(pictureEl);
  setPictureBgEl(pictureEl);

  const pictureBgEl = getPictureBgEl(pictureEl);
  const pictureBgList = getPictureBgList(pictureBgEl);
  const pictureBgProps = getPictureBgProps(bgProps);

  setPictureBgProps(pictureEl, pictureBgEl, pictureBgList, pictureBgProps);
  setPictureBgImage(pictureBgList)

  let setPictureBgImageTimeout = null;

  window.addEventListener('resize', () => {
    clearTimeout(setPictureBgImageTimeout);
    
    setPictureBgImageTimeout = setTimeout(() => {
      setPictureBgImage(pictureBgList)
    }, 250);
  });
}

function getPictureEl(el) {
  if (typeof el === 'string') {
    return document.querySelector(el)
  } else if (el instanceof HTMLPictureElement === true) {
    return el;
  } else {
    return false;
  }
}

function setPictureElHidden(pictureEl) {
  const imgEl = pictureEl.querySelector('img');
  imgEl.style.opacity = 0;
}

function setPictureBgEl(pictureEl) {
  const pictureSources = [...pictureEl.querySelectorAll('source')];

  const pictureBg = pictureSources
    .map(source => {
      const media = source.getAttribute('media');
      const breakpoint = media.replace(/\D+(\d+)\D+/gm, '$1');
      const type = source.getAttribute('type');
      const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset');
      const src = srcset.match(/,/gm) ? srcset.split(',').shift() : srcset;

      return `
        <div 
          data-type="${type}" 
          data-media="${media}" 
          data-breakpoint="${breakpoint}" 
          data-background="${src}"
        ></div>
      `;
    })
    .join('')

  const pictureBgClass = 'fluid-picture-backgrounds'
  const pictureBgMarkup = `<div class="${pictureBgClass}">${pictureBg}</div>`;
  
  pictureEl.insertAdjacentHTML('afterbegin', pictureBgMarkup);
}

function getPictureBgEl(pictureEl) {
  const pictureBgEl = pictureEl.querySelector('.fluid-picture-backgrounds');
  return pictureBgEl
}

function getPictureBgList(pictureBgEl) {
  const pictureBgList = [...pictureBgEl.children];
  return pictureBgList;
}

function  getPictureBgProps(pictureBgProps) {
  const bgp = typeof backgroundProperties === 'object' 
    ? pictureBgProps 
    : {};

  return {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    ...bgp
  }
}

function setPictureBgProps(pictureEl, pictureBgEl, pictureBgList, pictureBgProps) {
  if (pictureEl.style.position !== 'absolute') {
    pictureEl.style.position = 'relative'
  }

  [ pictureBgEl, ...pictureBgList ].forEach(el => {
    el.style.position = 'absolute';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.transform = 'translate(-50%, -50%)';
  });

  pictureBgList.forEach(pictureBgEl => {
    Object.keys(pictureBgProps).forEach(propertyName => {
      const propertyValue = pictureBgProps[propertyName];
      if (pictureBgEl && propertyValue && pictureBgEl.style[propertyName] !== propertyValue) {
        pictureBgEl.style[propertyName] = propertyValue;
      }
    });
  });
}

function setPictureBgImage(pictureBgList) {
  // Get the breakpoints from the active media queries
  const pictureBgMedia = pictureBgList.reduce((acc, pictureBgEl) => {
    const { media, breakpoint } = pictureBgEl.dataset;
    const { matches } = window.matchMedia(media);
    if (matches) {
      const bp = Number(breakpoint)
      return Array.isArray(acc) ? acc.concat(bp) : [bp];
    } else {
      return Array.isArray(acc) ? acc : []
    }
  }, []);

  // Get the highest breakpoint from the list of breakpoints
  const pictureBgBreakpoint = Math.max(...pictureBgMedia);

  // Toggle the background images using the highest breakpoint as the checking mechanism
  pictureBgList.forEach(pictureBgEl => {
    const { breakpoint, background }= pictureBgEl.dataset;

    if (pictureBgBreakpoint === Number(breakpoint)) {
      const backgroundImage = `url(${background})`;

      if (pictureBgEl.style.backgroundImage !== backgroundImage) {
        pictureBgEl.style.backgroundImage = backgroundImage; 
      }
      pictureBgEl.style.display = '';
    } else {
      pictureBgEl.style.display = 'none';
    }
  })
}
