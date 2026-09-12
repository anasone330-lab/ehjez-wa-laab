import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import BookingScreen from './BookingScreen';
import ConfirmationScreen from './ConfirmationScreen';
import BookingsListScreen from './BookingsListScreen';
import ProfileScreen from './ProfileScreen';
import SupportScreen from './SupportScreen';
import OwnerDashboardScreen from './OwnerDashboardScreen';
import RatingScreen from './RatingScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [ratingStadium, setRatingStadium] = useState(null);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  
  // نظام الولاء: عداد الحجوزات المكتملة
  const [completedBookingsCount, setCompletedBookingsCount] = useState(19);

  // قائمة الحجوزات
  const [userBookings, setUserBookings] = useState([
    {
      id: 'HB-8921',
      stadium: { name: 'ملعب الأسطورة الخماسي', price: '30,000 د.ع' },
      customerName: 'حيدر علي',
      customerEmail: 'haider@example.com',
      time: '08:00 مساءً - 09:00 مساءً',
      date: '2026-09-15',
      status: 'مؤكد (دفع كامل)',
      type: 'حجز عادي',
      isChallenge: true,
      bookingHoursLeft: 48
    }
  ]);

  // مشاركة تفاصيل الحجز والقطية عبر الواتساب
  const shareKattiya = (booking) => {
    const message = `شباب، تم حجز ${booking.stadium.name} لموعد ${booking.time}.\nالمبلغ مدفوع بالكامل (${booking.stadium.price}).\nحصة كل لاعب: 3,000 د.ع.\nكود الحجز: ${booking.id}`;
    Share.share({ message });
  };

  // إلغاء الحجز بناءً على شرط الـ 24 ساعة
  const handleCancelBooking = (bookingId, hoursLeft) => {
    if (hoursLeft < 24) {
      Alert.alert(
        "إلغاء غير متاح",
        "لا يمكن إلغاء الحجز قبل أقل من 24 ساعة من موعد المباراة، ويسقط الحق بالمال كاملاً لصاحب الملعب."
      );
    } else {
      Alert.alert(
        "تأكيد الإلغاء",
        "سيتم إلغاء الحجز وإعادة المبلغ لك كاملاً لأن الموعد متبقي عليه أكثر من 24 ساعة.",
        [
          { text: "تراجع", style: "cancel" },
          { 
            text: "تأكيد الإلغاء", 
            onPress: () => {
              setUserBookings(userBookings.filter(b => b.id !== bookingId));
            } 
          }
        ]
      );
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={(role) => {
          setUserRole(role);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  if (userRole === 'owner') {
    return (
      <OwnerDashboardScreen
        bookings={userBookings}
        onLogout={() => {
          setIsLoggedIn(false);
          setUserRole('customer');
        }}
      />
    );
  }

  if (ratingStadium) {
    return (
      <RatingScreen
        stadiumName={ratingStadium.name}
        onBack={() => setRatingStadium(null)}
      />
    );
  }

  if (activeTab === 'support') {
    return <SupportScreen onBack={() => setActiveTab('home')} />;
  }

  if (activeTab === 'profile') {
    return (
      <ProfileScreen
        completedBookingsCount={completedBookingsCount}
        onLogout={() => {
          setIsLoggedIn(false);
          setActiveTab('home');
        }}
        onBack={() => setActiveTab('home')}
      />
    );
  }

  if (activeTab === 'bookings') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: 40 }}>
        <Text style={styles.sectionHeader}>حجوزاتي الراهنة</Text>
        <ScrollView style={{ padding: 16 }}>
          {userBookings.map((item) => (
            <View key={item.id} style={styles.bookingCard}>
              <Text style={styles.stadiumTitle}>{item.stadium.name}</Text>
              <Text style={styles.bookingDetail}>الوقت: {item.time}</Text>
              <Text style={styles.bookingDetail}>الحالة: {item.status}</Text>
              
              {item.isChallenge && (
                <View style={styles.challengeBadge}>
                  <Text style={styles.challengeText}>⚽ نطلب فريقاً منافساً (تحدي)</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.shareBtn} onPress={() => shareKattiya(item)}>
                  <Text style={styles.btnText}>📲 تقسيم القطية (واتساب)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.cancelBtn, item.bookingHoursLeft < 24 && styles.disabledBtn]} 
                  onPress={() => handleCancelBooking(item.id, item.bookingHoursLeft)}
                >
                  <Text style={styles.btnText}>
                    {item.bookingHoursLeft < 24 ? "غير قابل للإلغاء" : "إلغاء الحجز"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.backBtn} onPress={() => setActiveTab('home')}>
          <Text style={styles.btnText}>العودة للرئيسية</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (bookingConfirmation) {
    return (
      <ConfirmationScreen
        bookingData={bookingConfirmation}
        onHome={() => {
          setBookingConfirmation(null);
          setSelectedStadium(null);
        }}
      />
    );
  }

  if (selectedStadium) {
    const isFreeThisBooking = (completedBookingsCount + 1) % 20 === 0;

    return (
      <BookingScreen
        stadium={selectedStadium}
        isFreeBooking={isFreeThisBooking}
        onBack={() => setSelectedStadium(null)}
        onConfirmBooking={(time) => {
          const newCount = completedBookingsCount + 1;
          const bookingCode = 'HB-' + Math.floor(1000 + Math.random() * 9000);
          
          const newBooking = {
            id: bookingCode,
            stadium: selectedStadium,
            customerName: 'اللاعب الحالي',
            customerEmail: 'player@example.com',
            time: time,
            status: 'مؤكد (دفع كامل)',
            type: isFreeThisBooking ? '🎁 حجز مجاني (مكافأة 20 حجز)' : 'حجز عادي',
            isChallenge: false,
            bookingHoursLeft: 48
          };

          if (isFreeThisBooking) {
            setCompletedBookingsCount(0);
          } else {
            setCompletedBookingsCount(newCount);
          }

          setUserBookings([newBooking, ...userBookings]);
          setBookingConfirmation(newBooking);
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* شريط نظام الولاء */}
      <View style={styles.loyaltyBanner}>
        <Text style={styles.loyaltyTitle}>🎁 مكافأة الولاء: كل 20 حجز = 1 حجز مجاني</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${(completedBookingsCount % 20) * 5}%` }]} />
        </View>
        <Text style={styles.loyaltySubtext}>
          حجوزاتك: {completedBookingsCount % 20} / 20 
          {(completedBookingsCount % 20 === 19) ? ' (حجزك القادم مجاني! 🎉)' : ''}
        </Text>
      </View>

      <HomeScreen
        onSelectStadium={(stadium) => setSelectedStadium(stadium)}
        onOpenRating={(stadium) => setRatingStadium(stadium)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loyaltyBanner: { backgroundColor: '#1e293b', paddingTop: 40, paddingBottom: 10, paddingHorizontal: 16 },
  loyaltyTitle: { color: '#facc15', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  progressBarBackground: { height: 8, backgroundColor: '#334155', borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 4 },
  loyaltySubtext: { color: '#94a3b8', fontSize: 11, textAlign: 'center', marginTop: 4 },
  sectionHeader: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  bookingCard: { backgroundColor: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 12 },
  stadiumTitle: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold' },
  bookingDetail: { color: '#cbd5e1', fontSize: 13, marginTop: 4 },
  challengeBadge: { backgroundColor: '#0284c7', padding: 6, borderRadius: 6, marginTop: 8 },
  challengeText: { color: '#ffffff', fontSize: 12, textAlign: 'center', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  shareBtn: { backgroundColor: '#16a34a', padding: 8, borderRadius: 6, flex: 0.48 },
  cancelBtn: { backgroundColor: '#ef4444', padding: 8, borderRadius: 6, flex: 0.48 },
  disabledBtn: { backgroundColor: '#64748b' },
  btnText: { color: '#ffffff', fontSize: 11, textAlign: 'center', fontWeight: 'bold' },
  backBtn: { backgroundColor: '#334155', padding: 12, margin: 16, borderRadius: 8 }
});
