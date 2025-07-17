import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Clock, User, AlertCircle, CheckCircle, XCircle, List, Grid } from 'lucide-react';

const SupportTicketsDemo = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sample ticket data
  const tickets = [
    {
      id: 'TKT-001',
      title: 'Unable to login to account',
      customer: 'John Smith',
      email: 'john.smith@email.com',
      priority: 'high',
      status: 'open',
      created: '2 hours ago',
      lastUpdated: '1 hour ago',
      assignee: 'Sarah Johnson',
      category: 'Account',
      description: 'Customer reports unable to access their account after password reset. Multiple login attempts have failed.',
      tags: ['login', 'password', 'urgent']
    },
    {
      id: 'TKT-002',
      title: 'Feature request: Dark mode',
      customer: 'Emily Davis',
      email: 'emily.davis@email.com',
      priority: 'medium',
      status: 'in-progress',
      created: '1 day ago',
      lastUpdated: '4 hours ago',
      assignee: 'Mike Chen',
      category: 'Feature Request',
      description: 'Customer requesting dark mode implementation for better user experience during night usage.',
      tags: ['enhancement', 'ui', 'dark-mode']
    },
    {
      id: 'TKT-003',
      title: 'Payment processing error',
      customer: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      priority: 'critical',
      status: 'resolved',
      created: '3 days ago',
      lastUpdated: '2 days ago',
      assignee: 'Lisa Park',
      category: 'Billing',
      description: 'Payment gateway returning error 500 during checkout process. Customer unable to complete purchase.',
      tags: ['payment', 'critical', 'resolved']
    },
    {
      id: 'TKT-004',
      title: 'Mobile app crashes on startup',
      customer: 'Anna Martinez',
      email: 'anna.martinez@email.com',
      priority: 'high',
      status: 'open',
      created: '5 hours ago',
      lastUpdated: '30 minutes ago',
      assignee: 'David Kumar',
      category: 'Technical',
      description: 'iOS app crashes immediately after launch. Occurs on iPhone 12 Pro with latest iOS version.',
      tags: ['mobile', 'crash', 'ios']
    },
    {
      id: 'TKT-005',
      title: 'Slow loading times',
      customer: 'James Brown',
      email: 'james.brown@email.com',
      priority: 'low',
      status: 'open',
      created: '1 week ago',
      lastUpdated: '2 days ago',
      assignee: 'Tom Anderson',
      category: 'Performance',
      description: 'Website loading times are significantly slower than usual. Affects multiple pages.',
      tags: ['performance', 'web', 'optimization']
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-700 bg-blue-100';
      case 'in-progress': return 'text-yellow-700 bg-yellow-100';
      case 'resolved': return 'text-green-700 bg-green-100';
      case 'closed': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle size={14} />;
      case 'in-progress': return <Clock size={14} />;
      case 'resolved': return <CheckCircle size={14} />;
      case 'closed': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
  };

  const TicketListItem = ({ ticket }) => (
    <div
      onClick={() => handleTicketClick(ticket)}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="font-semibold text-gray-900 mr-3">{ticket.id}</span>
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
          </div>
          <h3 className="text-base text-gray-800 font-medium leading-5">
            {ticket.title}
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full flex items-center ${getStatusColor(ticket.status)}`}>
          {getStatusIcon(ticket.status)}
          <span className="ml-1 text-xs font-medium capitalize">{ticket.status}</span>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <User size={14} className="mr-1" />
        <span className="mr-4">{ticket.customer}</span>
        <Clock size={14} className="mr-1" />
        <span>{ticket.created}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{ticket.category}</span>
        <span className="text-sm text-gray-500">Assigned to {ticket.assignee}</span>
      </div>
    </div>
  );

  const TicketCard = ({ ticket }) => (
    <div
      onClick={() => handleTicketClick(ticket)}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50 w-full max-w-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
        <div className={`px-3 py-1 rounded-full flex items-center ${getStatusColor(ticket.status)}`}>
          {getStatusIcon(ticket.status)}
          <span className="ml-1 text-xs font-medium capitalize">{ticket.status}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">{ticket.id}</h3>
        <p className="text-sm text-gray-800 font-medium leading-5 mb-4">
          {ticket.title}
        </p>
      </div>
      
      <div className="flex items-center mb-3">
        <User size={12} className="mr-2" />
        <span className="text-xs text-gray-600">{ticket.customer}</span>
      </div>
      
      <div className="flex items-center mb-4">
        <Clock size={12} className="mr-2" />
        <span className="text-xs text-gray-600">{ticket.created}</span>
      </div>
      
      <div className="border-t border-gray-100 pt-3">
        <div className="text-xs text-gray-500 mb-2">{ticket.category}</div>
        <div className="text-xs text-gray-500 truncate">
          {ticket.assignee}
        </div>
      </div>
    </div>
  );

  const TicketDetailsModal = () => {
    if (!showDetails || !selectedTicket) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedTicket.id}
            </h2>
            <button
              onClick={() => setShowDetails(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XCircle size={24} className="text-gray-500" />
            </button>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedTicket.title}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-gray-600 font-medium">Customer:</span>
              <p className="text-gray-900">{selectedTicket.customer}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Email:</span>
              <p className="text-gray-900">{selectedTicket.email}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Priority:</span>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(selectedTicket.priority)} mr-2`} />
                <span className="text-gray-900 capitalize">{selectedTicket.priority}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Assignee:</span>
              <p className="text-gray-900">{selectedTicket.assignee}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Category:</span>
              <p className="text-gray-900">{selectedTicket.category}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Last Updated:</span>
              <p className="text-gray-900">{selectedTicket.lastUpdated}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-gray-600 font-medium mb-2">Description:</h4>
            <p className="text-gray-800 text-sm leading-6 bg-gray-50 p-4 rounded-lg">
              {selectedTicket.description}
            </p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-gray-600 font-medium mb-2">Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTicket.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              Edit
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={16} />
            <span className="font-medium">List View</span>
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'card' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid size={16} />
            <span className="font-medium">Card View</span>
          </button>
        </div>
      </div>

      {/* Tickets Display */}
      <div className="px-6 py-6">
        {viewMode === 'list' ? (
          <div className="max-w-4xl">
            {tickets.map((ticket) => (
              <TicketListItem key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      <TicketDetailsModal />
    </div>
  );
};

export default SupportTicketsDemo;