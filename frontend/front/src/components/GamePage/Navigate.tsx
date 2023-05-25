import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isGameQuitAtom } from '../atom/GameAtom';
export default function Navigate() {

  const isGameQuit = useAtomValue(isGameQuitAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (isGameQuit) {
      navigate("/chat");
    }
  }, [isGameQuit]);

  return (
    <>
    </>
  );
}
