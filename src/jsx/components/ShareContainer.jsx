import React, { useRef } from 'react';

// https://www.npmjs.com/package/uuid4
// import uuid4 from 'uuid4';

import PropTypes from 'prop-types';

function ShareContainer({ url }) {
  const shareButtonsRef = useRef();
  const iconButtonsRef = useRef();
  const messageRef = useRef();

  const shareButton = (event) => {
    const specs = `top=${(window.screen.height / 2) - (420 / 2)},left=${(window.screen.width / 2) - (550 / 2)},toolbar=0,status=0,width=550,height=420`;
    window.open(event.currentTarget.href, 'Jaa', specs);
    event.preventDefault();
  };

  const show = (event) => {
    document.querySelectorAll('.share_container').forEach((el) => {
      if (el.querySelector('.share_buttons') !== shareButtonsRef.current) {
        el.querySelector('.share_buttons').style.display = 'none';
        el.querySelector('.icon_container button img').src = 'https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_share.png';
      }
    });
    if (shareButtonsRef.current.style.display === 'none') {
      shareButtonsRef.current.style.display = 'block';
      iconButtonsRef.current.querySelector('img').src = 'https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_close.png';
    } else {
      shareButtonsRef.current.style.display = 'none';
      iconButtonsRef.current.querySelector('img').src = 'https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_share.png';
    }
    event.preventDefault();
  };

  const copyToClipboard = (event, text) => {
    // Copy the text inside the text field
    navigator.clipboard.writeText(text);
    messageRef.current.style.opacity = 1;
    messageRef.current.classList.add('active');
    setTimeout(() => {
      messageRef.current.classList.remove('active');
      messageRef.current.style.opacity = 0;
    }, 1000);
    event.preventDefault();
  };

  return (
    <div className="share_container">
      <div className="icon_container" onClick={(event) => show(event)} onKeyDown={(event) => show(event)} role="presentation"><button type="button" ref={iconButtonsRef}><img src="https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_share.png" alt="Share" /></button></div>
      <div className="share_buttons" ref={shareButtonsRef} style={{ display: 'none' }}>
        <div className="share_button"><a href={`https://www.facebook.com/sharer/sharer.php?u=${(url)}`} onClick={(event) => shareButton(event)}><img src="https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_facebook.png" alt="Facebook" /></a></div>
        <div className="share_button"><a href={`https://twitter.com/share?url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent('unctad')}&text=${encodeURIComponent('')}`} onClick={(event) => shareButton(event, url)}><img src="https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_x.png" alt="X" /></a></div>
        {/* <div className="share_button"><a href={`https://twitter.com/share?url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent('unctad')}&text=${encodeURIComponent('')}`} onClick={(event) => shareButton(event, url)}><img src="https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_instagram.png" alt="Instagram" /></a></div> */}
        <div className="share_button"><a href={`whatsapp://send?text=${encodeURIComponent(url)}`}><img src="https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_whatsapp.png" alt="Whatspp" /></a></div>
        <div className="share_button"><a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`} onClick={(event) => shareButton(event)}><img src="https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_linkedin.png" alt="LinkedIn" /></a></div>
        <div className="share_button">
          <a href="CO" onClick={(event) => copyToClipboard(event, url)}><img src="https://storage.unctad.org/2025-tdr_report/assets/img/icons/icon_link.png" alt="Share" /></a>
          <div className="copied_message" ref={messageRef}>Copied to clipboard</div>
        </div>
      </div>
    </div>
  );
}

ShareContainer.propTypes = {
  url: PropTypes.string.isRequired
};

export default ShareContainer;
