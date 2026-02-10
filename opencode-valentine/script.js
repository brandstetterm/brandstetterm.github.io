/**
 * Valentine's Day Envelope
 * Click handler with sequenced animations
 */

document.addEventListener('DOMContentLoaded', () => {
  const heartSeal = document.querySelector('.heart-seal');
  const envelope = document.querySelector('.envelope');
  const flapWrapper = document.querySelector('.envelope-flap-wrapper');
  
  // Get flap duration from CSS variable
  const styles = getComputedStyle(document.documentElement);
  const flapDuration = parseFloat(styles.getPropertyValue('--flap-duration')) * 1000;

  // Open envelope when heart is clicked
  heartSeal.addEventListener('click', () => {
    // Step 1: Start flap animation
    envelope.classList.add('open');
    
    // Step 2: At 50% of flap animation, change flap color to show inside
    setTimeout(() => {
      envelope.classList.add('flap-inside');
    }, flapDuration / 2);
    
    // Step 3: After flap finishes, drop its z-index so letter can appear in front
    setTimeout(() => {
      envelope.classList.add('flap-behind');
    }, flapDuration);
  });
});
