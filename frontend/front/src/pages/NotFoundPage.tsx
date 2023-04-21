import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasLoginAtom } from '../components/atom/SocketAtom';
import { useAtom } from 'jotai';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [hasLogin,] = useAtom(hasLoginAtom);

  useEffect(() => {
    if (!hasLogin) {
      navigate('/');
    } else {
      navigate('/chat');
    }
  }, []);
  return <div>error page</div>;
}
