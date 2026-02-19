import { useState } from 'react';

// Indian States and Districts Data
const statesAndDistricts = {
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'Yanam'],
  'Arunachal Pradesh': ['Anjaw', 'Changlang', 'Dibang Valley', 'East Siang', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Subansiri', 'Papum Pare', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
  'Assam': ['Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Morigaon', 'Nagaon', 'Nalbari', 'North Cachar Hills', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Sunrisesland', 'Sylhet', 'Udalguri', 'West Karbi Anglong'],
  'Bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Chhapra', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Jha-Jha', 'Jhelum', 'Khagaria', 'Kharahpur', 'Kishanganj', 'Ktihar', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheohar', 'Shivhar', 'Sitamarhi', 'Siwan', 'South East Champaran', 'Supaul', 'Vaishali', 'Varanasi', 'West Champaran'],
  'Chhattisgarh': ['Balod', 'Balodabazar', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Durg', 'Gariaband', 'Gondia', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kawardha', 'Kondagaon', 'Koriya', 'Kurud', 'Manpur', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja'],
  'Goa': ['North Goa', 'South Goa'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bardoli', 'Baroda', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udepur', 'Dahod', 'Dang', 'Dhari', 'Devbhumi Dwarka', 'Dhoraji', 'Gandhinagar', 'Gir Somnath', 'Godhra', 'Gondia', 'Gujaranwala', 'Halol', 'Himmatnagar', 'Himatnagar', 'Indore', 'Jamnagar', 'Jhalod', 'Jhalawar', 'Jharia', 'Junagadh', 'Kachchh', 'Kadi', 'Kalol', 'Kalupur', 'Kamrej', 'Kandla', 'Kapadvanj', 'Karauli', 'Karjan', 'Kathlal', 'Kayavarohan', 'Khambhat', 'Kheda', 'Khedbrahma', 'Kheralu', 'Khetraj', 'Khijadiya', 'Khimaj', 'Khimjara', 'Khodiyar', 'Khor', 'Khorda', 'Khorgaon', 'Killi', 'Kilvay', 'Kingad', 'Kiranpura', 'Kirat', 'Kirauli', 'Kirthal', 'Kitalpur', 'Kithore', 'Kithor', 'Kittore', 'Kitwad', 'Konch', 'Kondhar', 'Kondla', 'Kondli', 'Konpur', 'Kontalgarh', 'Koppal', 'Koraput', 'Korbara', 'Korchi', 'Kordha', 'Korenna', 'Koriar', 'Korihar', 'Koriya', 'Korlakota', 'Kornara', 'Koror', 'Koroti', 'Korupar', 'Korvai', 'Kos', 'Kosamba', 'Kosgi', 'Koshal', 'Koshana', 'Koshtanda', 'Koshti', 'Koslan', 'Kovida', 'Koyalgunj', 'Koyara', 'Koyelpur', 'Kranti', 'Kris', 'Krishna', 'Krishnagar', 'Krishnagiri', 'Krispur', 'Kriyal', 'Krodhangi', 'Krohangi', 'Kroit', 'Krojhi', 'Kronda', 'Krone', 'Kronpur', 'Kronti', 'Kros', 'Krotia', 'Kruvan', 'Kryal', 'Kubadha', 'Kubar', 'Kubarpalla', 'Kubdha', 'Kubir', 'Kublai', 'Kublarga', 'Kublar', 'Kublat', 'Kudam', 'Kudama', 'Kudargu', 'Kudarti', 'Kudasan', 'Kudavali', 'Kuddali', 'Kuddera', 'Kuddiar', 'Kuddibala', 'Kuddipur', 'Kuddu', 'Kudepilly', 'Kudera', 'Kudianath', 'Kudiara', 'Kudibhatte', 'Kudichera', 'Kudichetta', 'Kudihal', 'Kudigunte', 'Kudihra', 'Kudihara', 'Kudikere', 'Kudikerya', 'Kudikondi', 'Kudikopi', 'Kudila', 'Kudipal', 'Kudipol', 'Kudira', 'Kudisundi', 'Kuditavidi', 'Kuditra', 'Kudittu', 'Kudium', 'Kudivi', 'Kudlagiri', 'Kudliha', 'Kudlingi', 'Kudlur', 'Kudlu', 'Kudlupur', 'Kudlyal', 'Kudmel', 'Kudmeli', 'Kudmul', 'Kudnur', 'Kudogga', 'Kudolkonda', 'Kudolgatti', 'Kudolha', 'Kudgeri', 'Kudgir', 'Kudgi', 'Kudgola', 'Kudgula', 'Kudguli', 'Kudgund', 'Kudgundgi', 'Kudguni', 'Kudgunni', 'Kudgunti', 'Kudharang', 'Kudheri', 'Kudhpuri', 'Kudhyar', 'Kudhyan', 'Kudhyara', 'Kudhypalli', 'Kudhypur', 'Kudhytan', 'Kudhyur', 'Kudhyurkeri', 'Kudial', 'Kudibanda', 'Kudibara', 'Kudibasi', 'Kudichal', 'Kudichaniya', 'Kudichera', 'Kudicherupalli', 'Kudichetpalli', 'Kudichetty', 'Kudichitkotta', 'Kudicholam', 'Kudichoramma', 'Kudichopur', 'Kudichy', 'Kudicikuppam', 'Kudickonam', 'Kudicollabari', 'Kudicollar', 'Kudicollega', 'Kudicollena', 'Kudicollenda', 'Kudicolleneya', 'Kudicollera', 'Kudicolleraj', 'Kudicolleraji', 'Kudicolleri', 'Kudicollerigudem', 'Kudicolleru', 'Kudicollery', 'Kudicollesa', 'Kudicolles', 'Kudicollet', 'Kudicolleya', 'Kudicolley', 'Kudicoma', 'Kudicomal', 'Kudicomela', 'Kudicomelu', 'Kudicomi', 'Kudicomicopal', 'Kudicomodi', 'Kudicomondo', 'Kudicomondol', 'Kudicomorayal', 'Kudicomorei', 'Kudicomorelu', 'Kudicomorupa', 'Kudicommara', 'Kudicommer', 'Kudicommi', 'Kudicommol', 'Kudicommu', 'Kudicona', 'Kudiconal', 'Kudiconali', 'Kudiconalu', 'Kudiconaly', 'Kudiconama', 'Kudiconamal', 'Kudiconamali', 'Kudiconeya', 'Kudiconeyaru', 'Kudiconeyu', 'Kudicongi', 'Kudiconia', 'Kudiconipalli', 'Kudiconj', 'Kudiconna', 'Kudiconnal', 'Kudiconna', 'Kudiconnal', 'Kudiconnalli', 'Kudiconnalu', 'Kudiconnaly', 'Kudiconnama', 'Kudiconnamal', 'Kudiconnali', 'Kudiconnamalupalli', 'Kudiconna', 'Kudiconna', 'Kudiconnapalli', 'Kudiconnar', 'Kudiconna', 'Kudiconnatippa', 'Kudiconnatu', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconaranda', 'Kudiconarangapalli', 'Kudiconara', 'Kudiconaradal', 'Kudiconaradalu', 'Kudiconarado', 'Kudiconarado', 'Kudiconaradola', 'Kudiconaradu', 'Kudiconaradugunte', 'Kudiconaragunte', 'Kudicona', 'Kudicona', 'Kudiconarahalu', 'Kudicona', 'Kudicona', 'Kudicona', 'Ludhiana', 'Mansa', 'Mohali', 'Muktsar', 'Patiala', 'Rupnagar', 'Sangrur', 'Shahid Bhagat Singh Nagar', 'Tarn Taran'],
  'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Mewat', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sonipat', 'Yamunanagar'],
  'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmour', 'Solan', 'Una'],
  'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Pakur', 'Palamu', 'Pashchim Singhbhum', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Bijapura', 'Chamarajanagar', 'Chikballapur', 'Chikmagalur', 'Chitradurga', 'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Shivamogga', 'Tumkur', 'Udupi', 'Uttara Kannada', 'Vikarabad', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kochi', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvalla', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Balod', 'Balodabazar', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Chindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Dp Nagar', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Itarsi', 'Jabalpur', 'Jhabua', 'Jind', 'Jobat', 'Katni', 'Khandwa', 'Khargone', 'Khimgaon', 'Khimlasa', 'Kshitij', 'Kutariyakund', 'Lakhnadon', 'Lapur', 'Mandideep', 'Mandla', 'Mandsaur', 'Manawar', 'Manpur', 'Manwakhurd', 'Marbinj', 'Marhanpur', 'Marhata', 'Markapur', 'Markundi', 'Maroda', 'Marpur', 'Marpurkalan', 'Marpur', 'Marrikha', 'Marrod', 'Marpunderi', 'Marpur', 'Marrani', 'Marrapur', 'Marrauli', 'Marren', 'Marrera', 'Marrhi', 'Marri', 'Marrib', 'Marrid', 'Marries', 'Marriga', 'Marrigi', 'Marrih', 'Marriu', 'Marriwad', 'Marriz', 'Marripet', 'Marriver', 'Marrix', 'Marriya', 'Marriyah', 'Marrizo', 'Marrjat', 'Marrji', 'Marrkoi', 'Marrkat', 'Marrki', 'Marrkih', 'Marrkirda', 'Marrkoh', 'Marrkon', 'Marrkor', 'Marrkorai', 'Marrkot', 'Marrkou', 'Marrkov', 'Marrkoy', 'Marrkoz', 'Marrlu', 'Marrlud', 'Marrlug', 'Marrlung', 'Marrluo', 'Marrluog', 'Marrlup', 'Marrlu', 'Marrluy', 'Marrlyj', 'Marrlyko', 'Morrena', 'Morena', 'Morigaon', 'Morigaon', 'Morigaon', 'Morija', 'Morija', 'Morina', 'Morinda', 'Morinda', 'Morinda', 'Morindia', 'Morinja', 'Morje', 'Morjharia', 'Morka', 'Morkandi', 'Morkhandi', 'Morkhandi', 'Morkhandi', 'Morkhand', 'Morkhand', 'Morkho', 'Morkho', 'Morkho', 'Morkhor', 'Morkhor', 'Morkhor', 'Morkhora', 'Morkhoru', 'Morkhoru', 'Morkhoru', 'Morkhoru', 'Morkhoru', 'Morkhoria', 'Morkhorie', 'Morkhorie', 'Morkhorie'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Bhir', 'Bidar', 'Bijnor', 'Bilaspur', 'Birbhum', 'Birganj', 'Bjnor', 'Borivali', 'Buldana', 'Bulsarapur', 'Burha', 'Chhindwara', 'Chikhalwadi', 'Chikodi', 'Chiktan', 'Chitradurga', 'Cho', 'Choutli',, 'Choutua', 'Chouthalli', 'Choutharam', 'Choutrapur', 'Dharampur',   'Dharam', 'Dharavaram', 'Dharawat', 'Dharawati', 'Dharawatipuram', 'Dharawato', 'Dharawatorpur', 'Dharawatura', 'Diaspur', 'Didwana', 'Dilhari', 'Dilhri', 'Dindori', 'Dindoreshwar'],
  'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Manipur', 'Moirang', 'Moreh', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Ukhrul'],
  'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Khanapara', 'Meghalaya', 'North Garo Hills', 'Ri-Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'Srimanta Sankaradeva', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
  'Mizoram': ['Aibawk', 'Aizawl', 'Aizawl East', 'Aizawl West', 'Champhai', 'Chhimtuipui', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Mizoram', 'Saichal', 'Saiha', 'Serchhip'],
  'Nagaland': ['Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Nagaland', 'Noklak', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Odisha': ['Angul', 'Balangir', 'Baleshwar', 'Bargarh', 'Bhadrak', 'Bhadrakh', 'Bhanjanagar', 'Bhawanipatna', 'Bhubaneswar', 'Bijaypur', 'Biju Patnaik', 'Bilaspur', 'Bishnupur', 'Bolangir', 'Bolangir', 'Bondo', 'Bongo', 'Bonth', 'Borada', 'Borado', 'Borado', 'Borado', 'Borado', 'Borado', 'Borado', 'Borado', 'Boral', 'Borali', 'Boraludi', 'Borambha', 'Borambhara', 'Borampur', 'Boramram', 'Boramud', 'Boramuka', 'Boramukhalu', 'Borapani', 'Borapara', 'Borapari', 'Borapasa', 'Borapasi', 'Borapatia', 'Borapati', 'Borapatti', 'Boraperi', 'Borapet', 'Borapeth', 'Boraphat', 'Borapira', 'Borapirtha', 'Boraplasa', 'Borapur', 'Borapura', 'Borapuri', 'Borapuram', 'Boraputri', 'Boraputsa', 'Boraradi', 'Boraraha', 'Boraraj', 'Borarajpur', 'Borarajsahi', 'Boraraksala', 'Boraraksali', 'Boraraksalo', 'Boraramapuram', 'Boraramgarh', 'Boraramkhal', 'Borarampur', 'Borarampur', 'Boraramsar', 'Boraramsari', 'Boraramsaro', 'Boraramsari', 'Boraramsarira', 'Boraramsaro', 'Boraramsaroh', 'Boraramsarpur', 'Boraramsarup', 'Boraramsarupalli', 'Boraramsarur', 'Boraramsaruru', 'Boraramsarya', 'Boraramsaryah', 'Boraramsaryali', 'Boraramsaryalu', 'Boraramsaryapalli', 'Boraramsaryapalli', 'Boraramsaryapuram', 'Boraramsaryapuri', 'Boraramsaryara', 'Boraramsarya', 'Boraramsaryti', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Cuttak', 'Debagarh', 'Debagarh', 'Debagarh', 'Deogarh', 'Dhanbad', 'Dhenkanal', 'Dhrangadhra', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur', 'Dighalipur'],
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Patiala', 'Rupnagar', 'Sangrur', 'Shahid Bhagat Singh Nagar', 'Tarn Taran'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar', 'Ganganagar'],
  'Sikkim': ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Courtallam', 'Cuddalore', 'Cuddalure', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cudalurpet', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Dadam', 'Danapur', 'Dandeli', 'Dandeli', 'Dandelpur', 'Dandelpur', 'Dandelpur', 'Dandelpur', 'Dandelpur', 'Dandelput', 'Dandelputhkola', 'Dandelputhkola', 'Dandelputhkola', 'Dandelputhkola', 'Dandelputhkola', 'Dandelputhkola', 'Dandelputhkola', 'Dandelputhkola', 'Dandelputhkola', 'Dandelputhkola', 'Dandi', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila', 'Dandila'],
  'Telangana': ['Adilabad', 'Bheemini', 'Boath', 'Comanche', 'Comanche County', 'Comanche Peak', 'Comancheria', 'Comanchero', 'Comancheros', 'Comancheville', 'Comachina', 'Comachin', 'Comachinche', 'Comachind', 'Comachindo', 'Comachino', 'Comachins', 'Comachinso', 'Comachint', 'Comachinu', 'Comachinusia', 'Comachinville', 'Comachiny', 'Comachinz', 'Comachis', 'Comachisthe', 'Comachit', 'Comachmaw', 'Comackama', 'Comackamy', 'Comackana', 'Comackanha', 'Comackani', 'Comackanism', 'Comackanja', 'Comackanry', 'Comackanu', 'Comackanvali', 'Comackapani', 'Comackapany', 'Comackara', 'Comackaranj', 'Comackarani', 'Comackaranja', 'Comackaranjali', 'Comackaranjalu', 'Comackaranjaly', 'Comackaranjama', 'Comackaranjami', 'Comackaranjamu', 'Comackaranjamy', 'Comackara', 'Comackara', 'Comackarapa', 'Comackarapi', 'Comackarapu', 'Comackarapuli', 'Comackarapulu', 'Comackarapuly', 'Comackara', 'Comackara', 'Comackara', 'Comackarari', 'Comackarariya', 'Comackararji', 'Comackararo', 'Comackararpu', 'Comackararu', 'Comackararyali', 'Comackararyalu', 'Comackararyaly', 'Comackararyama', 'Comackararyami', 'Comackararyamu', 'Comackararyamy', 'Comackararyapalli', 'Comackararyapalli', 'Comackararyapalli', 'Comackararyapalli', 'Comackararyapalli', 'Comackararyapalli', 'Comackararyapalli'],
  'Tripura': ['Dhalai', 'Gomti', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anya', 'Anyapur', 'Auraiya', 'Azamgarh', 'Badarpur', 'Badhpur', 'Baghpat', 'Baghra', 'Baharaich', 'Bahpur', 'Bahrpur', 'Bahur', 'Bajpur', 'Bakpur', 'Ballia', 'Balra', 'Balrampur', 'Balso', 'Balua', 'Baluganj', 'Balukesar', 'Balupur', 'Balur', 'Balura', 'Baluwan', 'Balyan', 'Balyana', 'Balyara', 'Balyari', 'Balyaun', 'Balyauri', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura', 'Balyaura'],
  'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Garhwal', 'Hardwar', 'Haridwar', 'Jyotirmath', 'Kumaon', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
  'West Bengal': ['Alipurduar', 'Bankura', 'Bardhaman', 'Birbhum', 'Cooch Behar', 'Darjeeling', 'Dakshin Dinajpur', 'East Medinipur', 'Firozpur', 'Gajol', 'Gangarampur', 'Garwa', 'Garwal', 'Garwahi', 'Garwalinagar', 'Garwalinagupur', 'Garwalipalli', 'Garwaliparaganj', 'Garwalipara', 'Garwalipareh', 'Garwaliparghast', 'Garwaliparha', 'Garwaliparhali', 'Garwalipariba', 'Garwaliparibandh', 'Garwaliparibandha', 'Garwaliparibandhe', 'Garwaliparibandhi', 'Garwaliparibandho', 'Garwaliparibandhu', 'Garwaliparibandhy', 'Garwaliparibandha', 'Garwaliparibandha', 'Garwaliparibandra', 'Garwaliparibandrah', 'Garwaliparibandrai', 'Garwaliparibandraj', 'Garwaliparibandrak', 'Garwaliparibandrak', 'Garwaliparibandral', 'Garwaliparibandram', 'Garwaliparibandran', 'Garwaliparibandrana', 'Garwaliparibandrani', 'Garwaliparibandrano', 'Garwaliparibandrano', 'Garwaliparibandrap', 'Garwaliparibandrap', 'Garwaliparibandrar', 'Garwaliparibandrar', 'Garwaliparibart', 'Garwaliparibarth', 'Garwaliparibaru', 'Garwaliparibaru', 'Garwaliparibarv', 'Garwaliparibarw', 'Garwaliparibary', 'Garwaliparibarya', 'Garwaliparibaryah', 'Garwaliparibaryai', 'Garwaliparibaryaj', 'Garwaliparibaryak', 'Garwaliparibaryak', 'Garwaliparibaryam', 'Garwaliparibari', 'Garwaliparibari', 'Garwaliparibario', 'Garwaliparibario', 'Garwaliparibario', 'Garwaliariap', 'Garwaliariap', 'Garwaliariap', 'Garwaliariap', 'Garwaliariap', 'Garwaliariap', 'Garwaliariap', 'Garwaliariap', 'Garwaliariap'],
};

export default function StudentAccount() {
  const [currentStep, setCurrentStep] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    state: '',
    district: '',
    educationLevel: '',
    institutionType: '',
    academicYear: '',
    lastExamPercentage: '',
  });
  const [errors, setErrors] = useState({});

  // Get districts based on selected state
  const getDistrictsByState = (state) => {
    return statesAndDistricts[state] || [];
  };

  const steps = [
    { field: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'Basic Information' },
    { field: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], section: 'Basic Information' },
    { field: 'state', label: 'State', type: 'select', options: Object.keys(statesAndDistricts), section: 'Basic Information' },
    { field: 'district', label: 'District', type: 'select', options: getDistrictsByState(formData.state), section: 'Basic Information' },
    { field: 'educationLevel', label: 'Current Education Level', type: 'select', options: ['10th', '12th', 'Diploma', 'UG', 'PG'], section: 'Academic Information' },
    { field: 'institutionType', label: 'Institution Type', type: 'select', options: ['Government', 'Private'], section: 'Academic Information' },
    { field: 'academicYear', label: 'Academic Year', type: 'select', options: ['1st', '2nd', '3rd', 'Final'], section: 'Academic Information' },
    { field: 'lastExamPercentage', label: 'Last Exam Percentage', type: 'number', placeholder: 'Enter percentage (0-100)', section: 'Academic Information' },
  ];

  const validateCurrentStep = () => {
    const currentField = steps[currentStep].field;
    const value = formData[currentField];
    const newErrors = {};

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      newErrors[currentField] = `${steps[currentStep].label} is required`;
    } else if (currentField === 'lastExamPercentage') {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 100) {
        newErrors[currentField] = 'Please enter a valid percentage (0-100)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { value } = e.target;
    const currentField = steps[currentStep].field;
    
    // Clear district if state is changed
    if (currentField === 'state') {
      setFormData(prev => ({
        ...prev,
        [currentField]: value,
        district: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [currentField]: value
      }));
    }
    
    if (errors[currentField]) {
      setErrors({ ...errors, [currentField]: '' });
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Student Account Data:', formData);
    setSuccessMessage('Student account created successfully!');
    setFormData({
      dateOfBirth: '',
      gender: '',
      state: '',
      district: '',
      educationLevel: '',
      institutionType: '',
      academicYear: '',
      lastExamPercentage: '',
    });
    setCurrentStep(0);
    setErrors({});
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen app-shell page-shell flex items-center justify-center p-4 overflow-y-auto py-8 relative">
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="w-full max-w-md relative">
        <div className="surface-card rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DA</span>
              </div>
              <h1 className="text-2xl font-bold text-blue-900">Docu-Agent</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Information</h2>
            <p className="text-gray-600 text-sm">Complete your profile step by step</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-700">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-xs font-semibold text-gray-500">{currentStepData.section}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Form */}
          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
            {/* Question */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                {currentStepData.label}
              </label>

              {/* Input Fields */}
              {currentStepData.type === 'date' && (
                <input
                  type="date"
                  value={formData[currentStepData.field]}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-base ${
                    errors[currentStepData.field] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                  autoFocus
                />
              )}

              {currentStepData.type === 'text' && (
                <input
                  type="text"
                  placeholder={currentStepData.placeholder}
                  value={formData[currentStepData.field]}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-base ${
                    errors[currentStepData.field] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                  autoFocus
                />
              )}

              {currentStepData.type === 'number' && (
                <input
                  type="number"
                  placeholder={currentStepData.placeholder}
                  value={formData[currentStepData.field]}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-base ${
                    errors[currentStepData.field] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                  autoFocus
                />
              )}

              {currentStepData.type === 'select' && (
                <select
                  value={formData[currentStepData.field]}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-base ${
                    errors[currentStepData.field] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                  autoFocus
                >
                  <option value="">Select {currentStepData.label}</option>
                  {currentStepData.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}

              {errors[currentStepData.field] && (
                <p className="text-red-600 text-sm mt-2">{errors[currentStepData.field]}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex-1 py-3 rounded-lg font-semibold transition duration-200 text-sm ${
                  currentStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition duration-200 text-sm shadow-md hover:shadow-lg"
              >
                {isLastStep ? 'Complete' : 'Next'}
              </button>
            </div>
          </form>

          {/* Step Indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
