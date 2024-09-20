import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Timeline.css';

const Timeline = () => {
  const [bodyData, setBodyData] = useState({});
  const [timelineData, setTimelineData] = useState([]);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const placeholderImage = 'https://via.placeholder.com/300x100'; // Placeholder image URL

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const { data } = await axios.get('https://arthurfrost.qflo.co.za/php/getTimeline.php');
        setBodyData(data.Body?.[0] || {});
        setTimelineData(data.Timeline || []);
      } catch (error) {
        console.error('Error fetching the timeline data:', error);
      }
    };

    fetchTimelineData();
  }, []);

  const handlePlayPause = useCallback((audioSrc, audioId) => {
    if (audioRef.current) {
      if (currentAudioId === audioId) {
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
        return;
      }
      audioRef.current.pause();
    }

    const newAudio = new Audio(`https://arthurfrost.qflo.co.za/${audioSrc}`);
    audioRef.current = newAudio;
    audioRef.current.play();
    audioRef.current.addEventListener('timeupdate', () => {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    });
    setCurrentAudioId(audioId);
  }, [currentAudioId]);

  const handleScrubberChange = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderPlayPauseButton = (audioId) => (
    <>
      {currentAudioId === audioId && audioRef.current && !audioRef.current.paused ? (
        <i className="bi bi-pause-fill"> Pause</i>
      ) : (
        <i className="bi bi-play-fill"> Play</i>
      )}
    </>
  );

  const chunkedSlides = [];
  const itemsPerSlide = 6;
  for (let i = 0; i < timelineData.length; i += itemsPerSlide) {
    chunkedSlides.push(timelineData.slice(i, i + itemsPerSlide));
  }

  return (
    <div className='container'>
      <div className="mt-5">
        {bodyData.About && (
          <div className="body-section text-center">
            <div className='hero'>
              <img
                src={`https://arthurfrost.qflo.co.za/${bodyData.Background}`}
                alt="Background"
                className="img-fluid hero-img mb-4"
                style={{ opacity: bodyData.BackgroundOpacity / 100 }}
                onError={(e) => { e.target.src = placeholderImage; }} // Add onError here
              />
              <div className='hero-text d-flex align-items-center justify-content-center'>
                <h1>Dr. Arthur Frost Welcomes You!</h1>
              </div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: bodyData.About }} className="about-text" />
          </div>
        )}
      </div>

      <div>
        <Carousel>
          {chunkedSlides.map((slide, index) => (
            <Carousel.Item key={index}>
              <div className="row">
                {slide.map(item => (
                  <div key={item.Id} className="col-md-4 mb-4">
                    <div className="card h-100">
                      <img
                        src={`https://arthurfrost.qflo.co.za/${item.Image}`}
                        alt={item.Title}
                        className="img-fluid rounded"
                        onError={(e) => { e.target.src = placeholderImage; }} // Add onError here
                      />
                      <div className="card-body">
                        <div className='d-flex flex-row'>
                          <img
                            src={`https://arthurfrost.qflo.co.za/${item.Icon}`}
                            alt={item.Icon}
                            className="img-icon"
                            onError={(e) => { e.target.src = placeholderImage; }}
                          />
                          <div>
                            <h5 className="card-title">{item.Title}</h5>
                            <p className="card-text">{item.Episode}</p>

                          </div>

                        </div>

                      </div>
                      <iframe title="youtube" loading='lazy'
                        src={`https://www.youtube.com/embed/${item.RemoteId}`}>
                      </iframe>
                      <div className="card-footer">
                        <button
                          className="btn btn-outline-secondary w-100"
                          onClick={() => handlePlayPause(item.Audio, item.Id)}
                        >
                          {renderPlayPauseButton(item.Id)}
                        </button>
                        {currentAudioId === item.Id && (
                          <>
                            <div className="scrubber mt-2">
                              <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleScrubberChange}
                                className="w-100"
                              />
                            </div>
                            <div className="audio-time d-flex justify-content-between mt-2">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default Timeline;
