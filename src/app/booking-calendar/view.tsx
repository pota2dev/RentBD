'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Booking {
  id: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  status: string;
  numberOfGuests?: number;
  totalPrice: number;
  Tenant: {
    User: {
      firstName?: string;
      lastName?: string;
      email: string;
      profilePicture?: string;
    };
  };
}

interface AvailabilityWindow {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  isAvailable: boolean;
  priceOverride: number | null;
}

interface BookingCalendarViewProps {
  propertyId: string;
  propertyTitle: string;
  bookings: Booking[];
  availabilityWindows: AvailabilityWindow[];
}

export default function BookingCalendarView({
  propertyId,
  propertyTitle,
  bookings,
  availabilityWindows
}: BookingCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    startDate: '',
    endDate: '',
    isAvailable: true,
    priceOverride: ''
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isDateBooked = (day: number): Booking | null => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    return bookings.find(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return date >= checkIn && date < checkOut && 
             ['PENDING', 'ACCEPTED', 'CONFIRMED'].includes(booking.status);
    }) || null;
  };

  const isDateUnavailable = (day: number): boolean => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    return availabilityWindows.some(window => {
      const startDate = new Date(window.startDate);
      const endDate = new Date(window.endDate);
      return date >= startDate && date <= endDate && !window.isAvailable;
    });
  };

  const handleAddAvailability = async () => {
    if (!availabilityForm.startDate || !availabilityForm.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Mock availability addition
      alert('Availability window added successfully!');
      setShowAvailabilityDialog(false);
      setAvailabilityForm({ startDate: '', endDate: '', isAvailable: true, priceOverride: '' });
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Failed to add availability window');
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!confirm('Are you sure you want to delete this availability window?')) return;

    try {
      alert('Availability window deleted successfully!');
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Failed to delete availability window');
    }
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Calendar</span>
                <span className="text-sm font-normal text-gray-500">{propertyTitle}</span>
              </CardTitle>
              <CardDescription>Manage property availability and view bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold">{monthName}</h3>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {calendarDays.map((day) => {
                  const bookedFor = isDateBooked(day);
                  const isUnavailable = isDateUnavailable(day);

                  return (
                    <div
                      key={day}
                      className={`aspect-square p-1 rounded border text-center text-sm font-medium cursor-pointer transition-colors
                        ${bookedFor
                          ? `${getBookingStatusColor(bookedFor.status)} border-current`
                          : isUnavailable
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-white border-gray-200 hover:bg-blue-50'
                        }
                      `}
                      onClick={() => bookedFor && setSelectedBooking(bookedFor)}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-semibold mb-4">Legend</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-100 border border-green-300"></div>
                    <span className="text-sm">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-100 border border-blue-300"></div>
                    <span className="text-sm">Accepted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-yellow-100 border border-yellow-300"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-50 border border-red-200"></div>
                    <span className="text-sm">Unavailable</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add Availability Button */}
          <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Availability Window</DialogTitle>
                <DialogDescription>
                  Define when your property is available or block dates.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={availabilityForm.startDate}
                    onChange={(e) =>
                      setAvailabilityForm({ ...availabilityForm, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={availabilityForm.endDate}
                    onChange={(e) =>
                      setAvailabilityForm({ ...availabilityForm, endDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Status</Label>
                  <Select
                    value={availabilityForm.isAvailable ? 'available' : 'unavailable'}
                    onValueChange={(value) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        isAvailable: value === 'available'
                      })
                    }
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Block Dates (Unavailable)</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price-override">Override Price (Optional)</Label>
                  <Input
                    id="price-override"
                    type="number"
                    step="0.01"
                    placeholder="Leave blank to use default price"
                    value={availabilityForm.priceOverride}
                    onChange={(e) =>
                      setAvailabilityForm({ ...availabilityForm, priceOverride: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleAddAvailability} className="w-full">
                  Add Window
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Selected Booking Details */}
          {selectedBooking && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBooking(null)}
                  className="absolute right-4 top-4"
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tenant Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Tenant</h4>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedBooking.Tenant.User.profilePicture} />
                      <AvatarFallback>
                        {selectedBooking.Tenant.User.firstName?.charAt(0)}
                        {selectedBooking.Tenant.User.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {selectedBooking.Tenant.User.firstName} {selectedBooking.Tenant.User.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{selectedBooking.Tenant.User.email}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Booking Dates */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Check-in</h4>
                  <p className="text-sm">
                    {new Date(selectedBooking.checkInDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Check-out</h4>
                  <p className="text-sm">
                    {new Date(selectedBooking.checkOutDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {selectedBooking.numberOfGuests && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{selectedBooking.numberOfGuests} guests</span>
                  </div>
                )}

                <Separator />

                {/* Price & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">${selectedBooking.totalPrice}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getBookingStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings
                .filter(b => new Date(b.checkInDate) >= new Date() && ['ACCEPTED', 'CONFIRMED'].includes(b.status))
                .slice(0, 3)
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <p className="font-medium text-sm">
                      {booking.Tenant.User.firstName} {booking.Tenant.User.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                      {' - '}
                      {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              {bookings.filter(b => new Date(b.checkInDate) >= new Date() && ['ACCEPTED', 'CONFIRMED'].includes(b.status)).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming bookings</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
