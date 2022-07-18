import { Session } from 'next-auth';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Message } from '../../constants/schema';
import { trpc } from '../../utils/trpc';

function MessageItem({
  message,
  session,
}: {
  message: Message;
  session: Session;
}) {
  return <li>{message.message}</li>;
}

function RoomPage() {
  const { query } = useRouter();
  const roomId = query.roomId as string;
  const { data: session } = useSession();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const { mutateAsync: sendMessageMutation } = trpc.useMutation([
    'room.send-message',
  ]);

  trpc.useSubscription(['room.onSendMessage', { roomId }], {
    // when we get the next message
    onNext: (message) => {
      setMessages((m) => [...m, message]);
    },
  });

  if (!session)
    return (
      <div>
        <button onClick={() => signIn()}>Login</button>
      </div>
    );

  return (
    <div>
      <ul>
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} session={session} />
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessageMutation({ roomId, message });
          setMessage('');
        }}
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='What do you want to say'
        />
        <button type='submit'>Send message</button>
      </form>
    </div>
  );
}

export default RoomPage;
