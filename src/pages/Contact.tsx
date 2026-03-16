import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Magnetic } from '../components/Visuals';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageSquare, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const TIME_SLOTS = [
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
];

export default function Contact() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hasPickedDate, setHasPickedDate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    countryCode: '+1',
    phone: '',
    description: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setHasPickedDate(true);
  };

  const phoneDigits = formData.phone.replace(/\D/g, '').slice(0, 10);
  const phoneIsValid = /^\d{10}$/.test(phoneDigits);
  const countryCodeIsValid = /^\+?\d{1,4}$/.test(formData.countryCode.trim());
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const canConfirmBooking =
    formData.name.trim().length > 0 &&
    emailIsValid &&
    formData.country.trim().length > 0 &&
    formData.countryCode.trim().length > 0 &&
    countryCodeIsValid &&
    phoneIsValid &&
    hasPickedDate &&
    !!selectedTime &&
    !isSubmitting &&
    !isSubmitted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setTouched({
      name: true,
      email: true,
      country: true,
      countryCode: true,
      phone: true,
    });

    if (!canConfirmBooking || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;

      const res = await fetch('/api/send-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          country: formData.country.trim(),
          countryCode: formData.countryCode.trim(),
          phoneNumber: phoneDigits,
          selectedDate: isoDate,
          selectedTime,
          notes: formData.description?.trim() || '',
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 md:h-16" />);
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(i)}
          className={`h-10 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-sm font-bold transition-all relative group ${
            isSelected(i)
              ? 'bg-brand-black text-brand-yellow shadow-md md:shadow-lg scale-105'
              : 'hover:bg-brand-yellow/20 text-brand-black/60 hover:text-brand-black'
          } ${isToday(i) ? 'border-2 border-brand-yellow' : ''}`}
        >
          {i}
          {isToday(i) && !isSelected(i) && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-yellow rounded-full" />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 bg-brand-ivory">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-black/40 mb-4 block">Booking</span>
          <h1 className="text-5xl md:text-8xl leading-[0.8] tracking-tighter mb-6">
            Start Your <span className="italic-serif font-normal">Trip.</span>
          </h1>
          <p className="text-xl opacity-60 max-w-2xl mx-auto">
            Ready to give your brand a soul? Book a strategy session and let's map out your journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Calendar & Time */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="paper-panel p-5 md:p-10 border-2 border-brand-black/5"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center border-2 border-brand-black shadow-[4px_4px_0px_rgba(10,10,10,1)]">
                    <CalendarIcon size={20} />
                  </div>
                  <h2 className="text-2xl font-display">Select a Date</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-brand-black/5 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-bold uppercase tracking-widest min-w-[140px] text-center">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-brand-black/5 rounded-full transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-brand-black/30 text-center py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="paper-panel p-5 md:p-10 border-2 border-brand-black/5"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center border-2 border-brand-black shadow-[4px_4px_0px_rgba(10,10,10,1)]">
                  <Clock size={20} />
                </div>
                <h2 className="text-2xl font-display">Select a Time (IST)</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-4 rounded-2xl text-sm font-bold transition-all border-2 ${
                      selectedTime === time
                        ? 'bg-brand-black text-brand-yellow border-brand-black shadow-lg scale-105'
                        : 'border-brand-black/5 hover:border-brand-yellow hover:bg-brand-yellow/10 text-brand-black/60 hover:text-brand-black'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="paper-panel p-5 md:p-10 border-2 border-brand-black/5 sticky top-32"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center border-2 border-brand-black shadow-[4px_4px_0px_rgba(10,10,10,1)]">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-2xl font-display">Your Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 ml-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/20" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-brand-input border-2 border-brand-black/5 rounded-2xl py-4 pl-12 pr-4 focus:border-brand-yellow outline-none transition-colors font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/20" size={18} />
                    <input
                      required
                      type="email"
                      placeholder="john@example.com"
                      className="w-full bg-brand-input border-2 border-brand-black/5 rounded-2xl py-4 pl-12 pr-4 focus:border-brand-yellow outline-none transition-colors font-medium"
                      value={formData.email}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {touched.email && !emailIsValid && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-600/80 ml-2">Enter a valid email</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 ml-2">Country Name</label>
                  <input
                    required
                    type="text"
                    placeholder="India"
                    className="w-full bg-brand-input border-2 border-brand-black/5 rounded-2xl py-4 px-4 focus:border-brand-yellow outline-none transition-colors font-medium"
                    value={formData.country}
                    onBlur={() => setTouched((t) => ({ ...t, country: true }))}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                  {touched.country && formData.country.trim().length === 0 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-600/80 ml-2">Country is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 ml-2">Phone</label>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/30 ml-2">Country Code</label>
                      <input
                        required
                        inputMode="tel"
                        placeholder="+91"
                        className="w-full bg-brand-input border-2 border-brand-black/5 rounded-2xl py-4 px-4 focus:border-brand-yellow outline-none transition-colors font-bold text-sm"
                        value={formData.countryCode}
                        onBlur={() => setTouched((t) => ({ ...t, countryCode: true }))}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            countryCode: e.target.value.replace(/[^\d+]/g, '').slice(0, 5),
                          })
                        }
                      />
                      {touched.countryCode && !countryCodeIsValid && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-600/80 ml-2">Invalid code</p>
                      )}
                    </div>
                    <div className="col-span-7">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/30 ml-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/20" size={18} />
                        <input
                          required
                          inputMode="numeric"
                          pattern="\d{10}"
                          maxLength={10}
                          type="tel"
                          placeholder="10-digit number"
                          className="w-full bg-brand-input border-2 border-brand-black/5 rounded-2xl py-4 pl-12 pr-4 focus:border-brand-yellow outline-none transition-colors font-medium"
                          value={phoneDigits}
                          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      {touched.phone && !phoneIsValid && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-600/80 ml-2">
                          Phone must be exactly 10 digits
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 ml-2">Any Notes (Optional)</label>
                  <textarea
                    placeholder="Tell us a bit about your brand and what you're looking to achieve..."
                    rows={4}
                    className="w-full bg-brand-input border-2 border-brand-black/5 rounded-2xl py-4 px-4 focus:border-brand-yellow outline-none transition-colors font-medium resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <Magnetic>
                    <button
                      disabled={!canConfirmBooking}
                      type="submit"
                      className={`w-full py-5 rounded-full text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                        isSubmitted
                          ? 'bg-green-500 text-white'
                          : canConfirmBooking
                          ? 'bg-brand-black text-brand-yellow hover:scale-[1.02] shadow-xl'
                          : 'bg-brand-black/10 text-brand-black/30 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitted ? (
                        <>
                          <Check size={20} /> Trip Booked!
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </Magnetic>
                  {submitError && (
                    <p className="text-[10px] text-center mt-4 font-bold uppercase tracking-widest text-red-600/80">
                      {submitError}
                    </p>
                  )}
                  {(!hasPickedDate || !selectedTime) && !isSubmitted && (
                    <p className="text-[10px] text-center mt-4 font-bold uppercase tracking-widest text-brand-black/30">
                      Please select a date and time to continue
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="paper-panel p-8 md:p-12 max-w-lg w-full text-center border-4 border-brand-black shadow-[15px_15px_0px_rgba(255,209,0,1)] md:shadow-[30px_30px_0px_rgba(255,209,0,1)]"
            >
              <div className="w-24 h-24 rounded-full bg-brand-yellow border-4 border-brand-black flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Check size={48} strokeWidth={3} />
              </div>
              <h2 className="text-4xl font-display mb-4">You're All Set!</h2>
              <p className="text-xl text-brand-black/60 mb-8 leading-relaxed">
                Your strategy session is confirmed for <span className="font-bold text-brand-black">{selectedDate.toLocaleDateString()}</span> at <span className="font-bold text-brand-black">{selectedTime}</span>. Check your email for details.
              </p>
              <Magnetic>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-10 py-4 bg-brand-black text-brand-yellow rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Close
                </button>
              </Magnetic>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
