import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Search, Paperclip, Smile, ArrowLeft, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Card, CardContent, CardHeader } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../utils/auth/context';
import { motion, AnimatePresence } from 'motion/react';

interface MessagingPageProps {
  onNavigate: (page: string) => void;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  isVerified?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'product' | 'barter-proposal';
  status: 'sent' | 'delivered' | 'read';
  attachments?: any[];
  productInfo?: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
  barterInfo?: {
    proposalId: string;
    items: string[];
    status: 'pending' | 'accepted' | 'declined';
  };
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  type: 'direct' | 'group' | 'business';
  isArchived?: boolean;
  isPinned?: boolean;
}

export function MessagingPage({ onNavigate }: MessagingPageProps) {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participants: [
        { id: '2', name: 'Accra Crafts', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786', isOnline: true, isVerified: true },
        { id: '1', name: 'You', avatar: '', isOnline: true }
      ],
      lastMessage: {
        id: '1',
        senderId: '2',
        content: 'Thank you for your interest in our Kente cloth! Would you like to see more designs?',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'text',
        status: 'read'
      },
      unreadCount: 2,
      type: 'business',
      isPinned: true
    },
    {
      id: '2',
      participants: [
        { id: '3', name: 'Lagos Artisans', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', isOnline: false, lastSeen: '2 hours ago', isVerified: true },
        { id: '1', name: 'You', avatar: '', isOnline: true }
      ],
      lastMessage: {
        id: '2',
        senderId: '1',
        content: 'Can we arrange a barter? I have traditional beadwork to trade.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text',
        status: 'delivered'
      },
      unreadCount: 0,
      type: 'business'
    },
    {
      id: '3',
      participants: [
        { id: '4', name: 'Natural Beauty Co', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', isOnline: true, isVerified: false },
        { id: '1', name: 'You', avatar: '', isOnline: true }
      ],
      lastMessage: {
        id: '3',
        senderId: '4',
        content: 'Your order has been prepared and will ship tomorrow!',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        type: 'text',
        status: 'read'
      },
      unreadCount: 0,
      type: 'business'
    }
  ]);

  // Sample messages for selected conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      content: 'Hello! I saw you\'re interested in our Traditional Kente Cloth. It\'s one of our most popular items.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      senderId: '1',
      content: 'Yes, I love the design! Can you tell me more about the quality and sizing?',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: '2',
      content: 'It\'s 100% authentic Ghanaian Kente, handwoven by local artisans. We have sizes from small to extra large.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      type: 'text',
      status: 'read'
    },
    {
      id: '4',
      senderId: '2',
      content: '',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'product',
      status: 'read',
      productInfo: {
        id: 1,
        name: 'Traditional Kente Cloth - Authentic Ghanaian Design',
        price: '£450',
        image: 'https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080'
      }
    },
    {
      id: '5',
      senderId: '1',
      content: 'Perfect! Would you be open to a barter trade? I have some handmade jewelry I could offer.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: 'text',
      status: 'read'
    },
    {
      id: '6',
      senderId: '2',
      content: 'Thank you for your interest in our Kente cloth! Would you like to see more designs?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'text',
      status: 'read'
    }
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: '1', // Current user
      content: messageInput.trim(),
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    // Simulate typing indicator and response
    setTimeout(() => setIsTyping(true), 500);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: '2',
        content: 'Thank you for your message! I\'ll get back to you shortly.',
        timestamp: new Date(),
        type: 'text',
        status: 'delivered'
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Mark messages as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const otherParticipant = selectedConv?.participants.find(p => p.id !== '1');

  return (
    <div className="h-screen flex bg-background">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('home')}
              className="md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Messages</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>New Message</DropdownMenuItem>
                <DropdownMenuItem>Mark All as Read</DropdownMenuItem>
                <DropdownMenuItem>Archived Chats</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.participants.find(p => p.id !== '1');
              const isSelected = selectedConversation === conversation.id;
              
              return (
                <motion.div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherUser?.avatar} />
                        <AvatarFallback>{otherUser?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm truncate">
                            {otherUser?.name}
                          </span>
                          {otherUser?.isVerified && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessage.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="ml-2 bg-primary text-primary-foreground text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar>
                  <AvatarImage src={otherParticipant?.avatar} />
                  <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{otherParticipant?.name}</span>
                    {otherParticipant?.isVerified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {otherParticipant?.isOnline ? 'Online' : `Last seen ${otherParticipant?.lastSeen}`}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Sheet open={showUserInfo} onOpenChange={setShowUserInfo}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Contact Info</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <div className="text-center mb-6">
                        <Avatar className="w-20 h-20 mx-auto mb-3">
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{otherParticipant?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {otherParticipant?.isOnline ? 'Online' : `Last seen ${otherParticipant?.lastSeen}`}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full">
                          View Profile
                        </Button>
                        <Button variant="outline" className="w-full">
                          View Products
                        </Button>
                        <Button variant="outline" className="w-full">
                          Block User
                        </Button>
                        <Button variant="outline" className="w-full text-destructive">
                          Report User
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => {
                  const isCurrentUser = message.senderId === '1';
                  const sender = selectedConv?.participants.find(p => p.id === message.senderId);
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={sender?.avatar} />
                          <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                        {message.type === 'product' && message.productInfo ? (
                          <Card className={`${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <CardContent className="p-3">
                              <div className="flex gap-3">
                                <ImageWithFallback
                                  src={message.productInfo.image}
                                  alt={message.productInfo.name}
                                  className="w-16 h-16 rounded object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium line-clamp-2">
                                    {message.productInfo.name}
                                  </h4>
                                  <p className="text-lg font-bold mt-1">
                                    {message.productInfo.price}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant={isCurrentUser ? "secondary" : "default"}
                                className="w-full mt-3"
                              >
                                View Product
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className={`p-3 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        )}
                        
                        <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isCurrentUser && (
                            <span className={message.status === 'read' ? 'text-blue-500' : ''}>
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {isCurrentUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={otherParticipant?.avatar} />
                    <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="pr-10"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p className="text-muted-foreground">
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}