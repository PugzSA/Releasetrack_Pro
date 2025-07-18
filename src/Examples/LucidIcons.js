// First, install Lucide React:
// npm install lucide-react

// Import the icons at the top of your component file
import { TrendingUp, Bug, Lightbulb, MessageSquare } from 'lucide-react';

// Option 1: Simple icon mapping function
const getTicketIcon = (ticketType) => {
  const iconProps = { size: 20, className: "mr-2" }; // Adjust size as needed
  
  switch (ticketType.toLowerCase()) {
    case 'enhancement':
      return <TrendingUp {...iconProps} className="mr-2 text-blue-600" />;
    case 'issue':
      return <Bug {...iconProps} className="mr-2 text-red-600" />;
    case 'new feature':
      return <Lightbulb {...iconProps} className="mr-2 text-green-600" />;
    case 'request':
      return <MessageSquare {...iconProps} className="mr-2 text-purple-600" />;
    default:
      return <MessageSquare {...iconProps} className="mr-2 text-gray-600" />;
  }
};

// Option 2: Icon configuration object (more scalable)
const ticketIconConfig = {
  enhancement: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  issue: {
    icon: Bug,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'new feature': {
    icon: Lightbulb,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  request: {
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
};

// Usage in your component:
const TicketList = ({ tickets }) => {
  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="flex items-center p-3 border rounded-lg">
          {/* Option 1 Usage: */}
          {getTicketIcon(ticket.type)}
          
          {/* OR Option 2 Usage: */}
          {(() => {
            const config = ticketIconConfig[ticket.type.toLowerCase()];
            if (!config) return null;
            const IconComponent = config.icon;
            return (
              <IconComponent 
                size={20} 
                className={`mr-2 ${config.color}`} 
              />
            );
          })()}
          
          <span className="font-medium">{ticket.title}</span>
          <span className="ml-auto text-sm text-gray-500">{ticket.type}</span>
        </div>
      ))}
    </div>
  );
};

// Example usage with sample data:
const App = () => {
  const sampleTickets = [
    { id: 1, title: "Improve dashboard performance", type: "Enhancement" },
    { id: 2, title: "Login button not working", type: "Issue" },
    { id: 3, title: "Add dark mode support", type: "New Feature" },
    { id: 4, title: "Need API documentation", type: "Request" }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Support Tickets</h2>
      <TicketList tickets={sampleTickets} />
    </div>
  );
};

// If you want individual icon components for more flexibility:
export const EnhancementIcon = ({ size = 20, className = "" }) => (
  <TrendingUp size={size} className={`text-blue-600 ${className}`} />
);

export const IssueIcon = ({ size = 20, className = "" }) => (
  <Bug size={size} className={`text-red-600 ${className}`} />
);

export const NewFeatureIcon = ({ size = 20, className = "" }) => (
  <Lightbulb size={size} className={`text-green-600 ${className}`} />
);

export const RequestIcon = ({ size = 20, className = "" }) => (
  <MessageSquare size={size} className={`text-purple-600 ${className}`} />
);