
import React from 'react';
import VoiceRoomInternal from './VoiceRoom/index';
import { Room, User, Gift, GameSettings } from '../types';

interface VoiceRoomProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  onMinimize: () => void;
  gifts: Gift[];
  gameSettings: GameSettings;
  onUpdateUser: (updatedData: Partial<User>) => void;
  users: User[];
  onOpenPrivateChat: (partner: User) => void;
  onOpenCP: () => void;
  onPushState: () => void;
}

const VoiceRoom: React.FC<VoiceRoomProps> = (props) => {
  return <VoiceRoomInternal {...props} />;
};

export default VoiceRoom;