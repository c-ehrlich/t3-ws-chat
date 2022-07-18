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
  const baseStyles =
    'mb-4 text-md w-7/12 p-4 text-gray-700 border border-gray-700 rounded-md';
  const liStyles =
    message.sender.name === session.user?.name
      ? baseStyles.concat(' self-end bg-gray-700 text-white')
      : baseStyles;

  return (
    <li className={liStyles}>
      <div className='flex flex-col'>
        <time>
          {message.sentAt.toLocaleTimeString('en-GB', {
            timeStyle: 'short',
          })}{' '}
          - {message.sender.name}
        </time>
        {message.message}
      </div>
    </li>
  );
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
    <div className='p-2 h-screen flex flex-col gap-4'>
      <ul className='flex flex-col flex-1 justify-end'>
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} session={session} />
        ))}
      </ul>
      <form
        className='flex gap-2'
        onSubmit={(e) => {
          e.preventDefault();
          sendMessageMutation({ roomId, message });
          setMessage('');
        }}
      >
        <textarea
          className='p-2 w-full text-gray-700 bg-gray-50 rounded-md border border-gray-700'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='What do you want to say'
        />
        <button
          className='flex-1 text-white bg-gray-900 px-2 py-1 rounded-md'
          type='submit'
        >
          Send message
        </button>
      </form>
    </div>
  );
}

export default RoomPage;
