import React, { /* useEffect , useState, useRef */ } from 'react';
import '../styles/styles.less';

function Footer() {
  return (
    <div className="app" id="app_footer">
      <div className="footer_container">
        <h2>What do you want to do next?</h2>
        <div className="footer_elements">
          <div className="footer_element footer_element_1">
            <div className="footer_content anchor_videos" id="anchor_videos">
              <h3>Watch the videos</h3>
              <div className="iframe_container youtube_iframe">
                <iframe
                  src="https://player.vimeo.com/video/1094502450?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=584799"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  title="UNCTAD’s Trade and Development Report 2025 – International investment in the digital economy"
                />
                <script src="https://player.vimeo.com/api/player.js" />
              </div>
              <ul>
                <li>
                  <a href="https://vimeo.com/1094772305" target="_blank" rel="noreferrer">Français</a>
                  {', '}
                  <a href="https://vimeo.com/1095588627" target="_blank" rel="noreferrer">Español</a>
                  {', '}
                  <a href="https://vimeo.com/1095400709" target="_blank" rel="noreferrer">العربية</a>
                  {', '}
                  <a href="https://vimeo.com/1095400950" target="_blank" rel="noreferrer">简体中文</a>
                  {', '}
                  <a href="https://vimeo.com/1095401066" target="_blank" rel="noreferrer">Русский</a>
                  {', '}
                  <a href="https://vimeo.com/1095401035" target="_blank" rel="noreferrer">Português</a>
                  {', '}
                  <a href="https://vimeo.com/1095401091" target="_blank" rel="noreferrer">Kiswahili</a>
                  {', '}
                  <a href="https://vimeo.com/1095401119" target="_blank" rel="noreferrer">Urdu اردو</a>
                  {', '}
                  <a href="https://vimeo.com/1095401007" target="_blank" rel="noreferrer">Hindi हिंदी</a>
                </li>
              </ul>
              <br />
              <h4>Watch the press conference</h4>
              <div className="iframe_container youtube_iframe">
                <iframe
                  src="https://player.vimeo.com/video/1094731567?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  title="UNCTAD&#039;s Trade and Development Report 2025 – Press conference"
                />
                <script src="https://player.vimeo.com/api/player.js" />
              </div>
              <div className="hidden">
                <h4>Media assets</h4>
                <ul className="hidden">
                  <li>
                    <a href="https://www.flickr.com/photos/unctad/albums/72177720323742073/" target="_blank" rel="noreferrer">Photos</a>
                  </li>
                  {/* <li>
                    <a href="#download" target="_blank" rel="noreferrer">Audio and other assets</a>
                  </li> */}
                </ul>
              </div>
            </div>
            <div className="footer_content anchor_podcasts" id="anchor_podcasts">
              <h3>Podcast</h3>
              <p>Listen to the Weekly Tradecast episode that explore some of the main issues in the report</p>
              <div className="iframe_container">
                <iframe title="139. Rethinking investment: Making money work for development" height="150" width="100%" style={{ border: 'none', minWidth: 'min(100%, 430px)' }} scrolling="no" data-name="pb-iframe-player" src="https://www.podbean.com/player-v2/?i=j86uq-18def52-pb&btn-skin=009EDB&download=1&font-color=000000&fonts=Verdana&from=pb6admin&logo_link=none&rtl=0&share=1&size=240&skin=ffffff" allowFullScreen />
                <a href="/podcast/rethinking-investment-making-money-work-development" target="_blank">Rethinking investment: Making money work for development</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
