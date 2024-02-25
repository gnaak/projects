import { useFetch } from '@/hooks/useFetch';
import { req } from '@/services';
import { getMusicInfo } from '@/services/getMusicInfo';
import { LyricsInterface } from '@/types/lyrics';
import { PitchInterface } from '@/types/pitch';
import { RealModeResponse, RealModeResult, S3SongInfo } from '@/types/song';
import { arUrl, infoUrl, mrUrl, origMusicUrl } from '@/utils/getS3URL';
import { parseLyricsTiming } from '@/utils/parseLyricsTiming';
import { parsePitchDuration } from '@/utils/parsePitchDuration';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { homePage, resultPage } from '../home';
import ARGuide from './ARGuide';
import LyricsComponent from './LyricsComponent';
import PlayMonitor from './PlayMonitor';

const RealMode = ({
  onModeChange,
  setResult,
  songId,
  song,
}: {
  onModeChange: Function;
  setResult: Dispatch<SetStateAction<RealModeResult | undefined>>;
  songId: number;
  song: S3SongInfo;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const bpm = useRef<number>(0);
  const gap = useRef<number>(0);
  const musicUrl = useRef<string>(mrUrl(song));
  const originalMusic = useRef<HTMLAudioElement>(null);
  const [parsedLyrics, setLyrics] = useState<LyricsInterface[]>([]);
  const [parsedPitches, setPitches] = useState<PitchInterface[]>([]);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [ArGuide, setArGuide] = useState<boolean>(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  let audioArray: BlobPart[] = [];

  const [isMrLoaded, setIsMrLoaded] = useState<boolean>(false);

  const [isLoading, response, error, postRecorder] = useFetch<RealModeResponse>(
    req.sing.saveLiveResult,
  );

  const handleSeconds = () => {
    if (audioRef.current) setCurrentSeconds(audioRef.current.currentTime);
  };
  const handleAR = () => {
    if (!ArGuide) {
      setArGuide(true)
      if (originalMusic.current) {
        originalMusic.current.volume = 0.5;
      }
    } else {
      setArGuide(false);
      if (originalMusic.current) {
        originalMusic.current.volume = 0;
      }
    }

 }
  const handleAudioEnd = () => {
    mediaRecorder?.stop();
  };
  useEffect(() => {
    if (!!response && !isLoading) {
      try {
        // post 요청이 성공하면 점수 페이지 렌더링
        setResult({
          practiceResultId: response.practiceResultId,
          artist: song.artist,
          title: song.songTitle,
          createdDate: response.createdDate,
        });
        setTimeout(() => onModeChange(resultPage), 500);
      } catch (err) {
        // post 요청이 실패하면 홈 페이지 렌더링
        console.log(error);
        setTimeout(() => onModeChange(homePage), 500);
      }
    }
  }, [response]);

  useEffect(() => {
    if (mediaRecorder && isMrLoaded) {
      mediaRecorder.ondataavailable = (e) => {
        audioArray.push(e.data);
      };

      mediaRecorder.onstop = (e) => {
        const blob = new Blob(audioArray, {
          type: 'audio/mp3 codecs=opus',
        });
        const formData = new FormData();
        formData.append('file', blob);

        postRecorder({ songId: songId, record: formData });
      };

      mediaRecorder.start();
      if (originalMusic.current) {
        originalMusic.current.volume = 0.5
      originalMusic.current?.play();}
      audioRef.current?.play();
      audioRef.current?.addEventListener('timeupdate', handleSeconds);
      audioRef.current?.addEventListener('ended', handleAudioEnd);
    }
  }, [mediaRecorder, isMrLoaded]);

  useEffect(() => {
    getMusicInfo(infoUrl(song))
      .then((info) => info)
      .then((lyrics) => {
        const lyricsArray: string[] = lyrics.trim().split('\n');
        bpm.current = +lyricsArray[6].split(':')[1] * 4;
        gap.current = +lyricsArray[7].split(':')[1] / 1000;
        setLyrics(parseLyricsTiming(lyricsArray, bpm.current, gap.current));
        setPitches(parsePitchDuration(lyricsArray, bpm.current, gap.current));
      });

    // 마이크가 입력 받는 소리를 mediaStream 객체로 취득
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        // mediaStream으로 들어오는 오디오 데이터를 mediaRecorder로 저장
        setMediaRecorder(new MediaRecorder(stream));
      });

    // 모바일 환경에서 canplaythrough 이벤트 캐치를 위해
    audioRef.current?.load();
    return () => {
      audioRef.current?.removeEventListener('timeupdate', handleSeconds);
      audioRef.current?.removeEventListener('ended', handleAudioEnd);
    };
  }, []);

  return (
    <main className="flex flex-col relative overflow-hidden">
      {audioRef.current ? (
        <>
          <PlayMonitor
            currentSeconds={currentSeconds}
            parsedPitches={parsedPitches}
          />
          <LyricsComponent
            currentSeconds={currentSeconds}
            parsedLyrics={parsedLyrics}
            isTutorial={false}
            audio={audioRef.current}
          />
          <button onClick={handleAR}>
            {!ArGuide ? '가이드 켜기' : '가이드 끄기'}
          </button>
        </>
      ) : (
        <></>
      )}
      <audio
        ref={audioRef}
        onCanPlayThrough={() => {
          setIsMrLoaded(true);
        }}
        src={musicUrl.current}
      ></audio>
      <audio
        src={origMusicUrl({
          artist: song.artist,
          songTitle: song.songTitle,
        })}
        ref={originalMusic}
      ></audio>
    </main>
  );
};

export default RealMode;