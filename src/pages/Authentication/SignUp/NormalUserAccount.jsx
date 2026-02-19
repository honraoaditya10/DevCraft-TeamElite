import { useState } from 'react';

// Indian States and Districts Data
const statesAndDistricts = {
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'Yanam'],
  'Arunachal Pradesh': ['Anjaw', 'Changlang', 'Dibang Valley', 'East Siang', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Subansiri', 'Papum Pare', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
  'Assam': ['Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Morigaon', 'Nagaon', 'Nalbari', 'North Cachar Hills', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Sunrisesland', 'Sylhet', 'Udalguri', 'West Karbi Anglong'],
  'Bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Chhapra', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Jha-Jha', 'Jhelum', 'Khagaria', 'Kharahpur', 'Kishanganj', 'Ktihar', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheohar', 'Shivhar', 'Sitamarhi', 'Siwan', 'South East Champaran', 'Supaul', 'Vaishali', 'Varanasi', 'West Champaran'],
  'Chhattisgarh': ['Balod', 'Balodabazar', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Durg', 'Gariaband', 'Gondia', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kawardha', 'Kondagaon', 'Koriya', 'Kurud', 'Manpur', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja'],
  'Goa': ['North Goa', 'South Goa'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bardoli', 'Baroda', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udepur', 'Dahod', 'Dang', 'Dhari', 'Devbhumi Dwarka', 'Dhoraji', 'Gandhinagar', 'Gir Somnath', 'Godhra', 'Gondia', 'Gujaranwala', 'Halol', 'Himmatnagar', 'Himatnagar', 'Indore', 'Jamnagar', 'Jhalod', 'Jhalawar', 'Jharia', 'Junagadh', 'Kachchh', 'Kadi', 'Kalol', 'Kalupur', 'Kamrej', 'Kandla', 'Kapadvanj', 'Karauli', 'Karjan', 'Kathlal', 'Kayavarohan', 'Khambhat', 'Kheda', 'Khedbrahma', 'Kheralu', 'Khetraj', 'Khijadiya', 'Khimaj', 'Khimjara', 'Khodiyar', 'Khor', 'Khorda', 'Khorgaon', 'Killi', 'Kilvay', 'Kingad', 'Kiranpura', 'Kirat', 'Kirauli', 'Kirthal', 'Kitalpur', 'Kittore', 'Kitwad', 'Konch', 'Kondhar', 'Kondla', 'Kondli', 'Konpur', 'Kontalgarh', 'Koppal', 'Koraput', 'Korbara', 'Korchi', 'Kordha', 'Korenna', 'Koriar', 'Korihar', 'Koriya', 'Korlakota', 'Kornara', 'Koror', 'Koroti', 'Korupar', 'Korvai', 'Kos', 'Kosamba', 'Kosgi', 'Koshal', 'Koshana', 'Koshtanda', 'Koshti', 'Koslan', 'Kovida', 'Koyalgunj', 'Koyara', 'Koyelpur', 'Kranti', 'Kris', 'Krishna', 'Krishnagar', 'Krishnagiri', 'Krispur', 'Kriyal', 'Krodhangi', 'Krohangi', 'Kroit', 'Krojhi', 'Kronda', 'Krone', 'Kronpur', 'Kronti', 'Kros', 'Krotia', 'Kruvan', 'Kryal', 'Kubadha', 'Kubar', 'Kubarpalla', 'Kubdha', 'Kubir', 'Kublai', 'Kublarga', 'Kublar', 'Kublat', 'Kudam', 'Kudama', 'Kudargu', 'Kudarti', 'Kudasan', 'Kudavali', 'Kuddali', 'Kuddera', 'Kuddiar', 'Kuddibala', 'Kuddipur', 'Kuddu', 'Kudepilly', 'Kudera', 'Kudianath', 'Kudiara', 'Kudibhatte', 'Kudichera', 'Kudichetta', 'Kudihal', 'Kudigunte', 'Kudihra', 'Kudihara', 'Kudikere', 'Kudikerya', 'Kudikondi', 'Kudikopi', 'Kudila', 'Kudipal', 'Kudipol', 'Kudira', 'Kudisundi', 'Kuditavidi', 'Kuditra', 'Kudittu', 'Kudium', 'Kudivi', 'Kudlagiri', 'Kudliha', 'Kudlingi', 'Kudlur', 'Kudlu', 'Kudlupur', 'Kudlyal', 'Kudmel', 'Kudmeli', 'Kudmul', 'Kudnur', 'Kudogga', 'Kudolkonda', 'Kudolgatti', 'Kudolha', 'Kudgeri', 'Kudgir', 'Kudgi', 'Kudgola', 'Kudgula', 'Kudguli', 'Kudgund', 'Kudgundgi', 'Kudguni', 'Kudgunni', 'Kudgunti', 'Kudharang', 'Kudheri', 'Kudhpuri', 'Kudhyar', 'Kudhyan', 'Kudhyara', 'Kudhypalli', 'Kudhypur', 'Kudhytan', 'Kudhyur', 'Kudhyurkeri', 'Kudial', 'Kudibanda', 'Kudibara', 'Kudibasi', 'Kudichal', 'Kudichaniya', 'Kudichera', 'Kudicherupalli', 'Kudichetpalli', 'Kudichetty', 'Kudicikuppam', 'Kudickonam', 'Kudicollabari', 'Kudicollar', 'Kudicollega', 'Kudicollena', 'Kudicollenda', 'Kudicolleneya', 'Kudicollera', 'Kudicolleraj', 'Kudicolleraji', 'Kudicolleri', 'Kudicollerigudem', 'Kudicolleru', 'Kudicollery', 'Kudicollesa', 'Kudicolles', 'Kudicollet', 'Kudicolleya', 'Kudicolley', 'Kudicoma', 'Kudicomal', 'Kudicomela', 'Kudicomelu', 'Kudicomi', 'Kudicomicopal', 'Kudicomodi', 'Kudicomondo', 'Kudicomondol', 'Kudicomorayal', 'Kudicomorei', 'Kudicomorelu', 'Kudicomorupa', 'Kudicommara', 'Kudicommer', 'Kudicommi', 'Kudicommol', 'Kudicommu', 'Kudicona', 'Kudiconal', 'Kudiconali', 'Kudiconalu', 'Kudiconaly', 'Kudiconama', 'Kudiconamal', 'Kudiconamali', 'Kudiconeya', 'Kudiconeyaru', 'Kudiconeyu', 'Kudicongi', 'Kudiconia', 'Kudiconipalli', 'Kudiconj', 'Kudiconna', 'Kudiconnal', 'Kudiconna', 'Kudiconnal', 'Kudiconnalli', 'Kudiconnalu', 'Kudiconnaly', 'Kudiconnama', 'Kudiconnamal', 'Kudiconnali', 'Kudiconnamalupalli', 'Kudiconna', 'Kudiconna', 'Kudiconnapalli', 'Kudiconnar', 'Kudiconna', 'Kudiconnatippa', 'Kudiconnatu', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconna', 'Kudiconaranda', 'Kudiconarangapalli', 'Kudiconara', 'Kudiconaradal', 'Kudiconaradalu', 'Kudiconarado', 'Kudiconarado', 'Kudiconaradola', 'Kudiconaradu', 'Kudiconaradugunte', 'Kudiconaragunte', 'Kudicona', 'Kudicona', 'Kudiconarahalu', 'Kudicona', 'Kudicona', 'Kudicona'],
  'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Mewat', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sonipat', 'Yamunanagar'],
  'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmour', 'Solan', 'Una'],
  'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Pakur', 'Palamu', 'Pashchim Singhbhum', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Bijapura', 'Chamarajanagar', 'Chikballapur', 'Chikmagalur', 'Chitradurga', 'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Shivamogga', 'Tumkur', 'Udupi', 'Uttara Kannada', 'Vikarabad', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kochi', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvalla', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Balod', 'Balodabazar', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Chindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Dp Nagar', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Itarsi', 'Jabalpur', 'Jhabua', 'Jind', 'Jobat', 'Katni', 'Khandwa', 'Khargone', 'Khimgaon', 'Khimlasa', 'Kshitij', 'Kutariyakund', 'Lakhnadon', 'Lapur', 'Mandideep', 'Mandla', 'Mandsaur', 'Manawar', 'Manpur', 'Manwakhurd', 'Marbinj', 'Marhanpur', 'Marhata', 'Markapur', 'Markundi', 'Maroda', 'Marpur', 'Marpurkalan', 'Marpur', 'Marrikha', 'Marrod', 'Marpunderi', 'Marpur', 'Marrani', 'Marrapur', 'Marrauli', 'Marren', 'Marrera', 'Marrhi', 'Marri', 'Marrib', 'Marrid', 'Marries', 'Marriga', 'Marrigi', 'Marrih', 'Marriu', 'Marriwad', 'Marriz', 'Marripet', 'Marriver', 'Marrix', 'Marriya', 'Marriyah', 'Marrizo', 'Marrjat', 'Marrji', 'Marrkoi', 'Marrkat', 'Marrki', 'Marrkih', 'Marrkirda', 'Marrkoh', 'Marrkon', 'Marrkor', 'Marrkorai', 'Marrkot', 'Marrkou', 'Marrkov', 'Marrkoy', 'Marrkoz', 'Marrlu', 'Marrlud', 'Marrlug', 'Marrlung', 'Marrluo', 'Marrluog', 'Marrlup', 'Marrlu', 'Marrluy', 'Marrlyj', 'Marrlyko', 'Morrena', 'Morena', 'Morigaon', 'Morigaon', 'Morigaon', 'Morija', 'Morija', 'Morina', 'Morinda', 'Morinda', 'Morinda', 'Morindia', 'Morinja', 'Morje', 'Morjharia', 'Morka', 'Morkandi', 'Morkhandi', 'Morkhandi', 'Morkhandi', 'Morkhand', 'Morkhand', 'Morkho', 'Morkho', 'Morkho', 'Morkhor', 'Morkhor', 'Morkhor', 'Morkhora', 'Morkhoru', 'Morkhoru', 'Morkhoru', 'Morkhoru', 'Morkhoru', 'Morkhoria', 'Morkhorie', 'Morkhorie', 'Morkhorie'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Bhir', 'Bidar', 'Bijnor', 'Bilaspur', 'Birbhum', 'Birganj', 'Bjnor', 'Borivali', 'Buldana', 'Bulsarapur', 'Burha', 'Chhindwara', 'Chikhalwadi', 'Chikodi', 'Chiktan', 'Chitradurga', 'Cho', 'Choto', 'Choto', 'Choto-Udepur', 'Choutli', 'Choutri', 'Choutri', 'Choutri', 'Choutri', 'Choutriyalli', 'Choutua', 'Chouthalli', 'Choutharam', 'Choutrapur', 'Choutri', 'Dharampur', 'Dharapuram', 'Dharashiv', 'Dharashiv', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharavi', 'Dharam', 'Dharapuram', 'Dharapuram', 'Dharapuram', 'Dharapuram', 'Dharavaram', 'Dharawas', 'Dharawas', 'Dharawas', 'Dharawasar', 'Dharawasi', 'Dharawasor', 'Dharawat', 'Dharawati', 'Dharawatipuram', 'Dharawato', 'Dharawatorpur', 'Dharawatura', 'Diaspur', 'Didwana', 'Dilhari', 'Dilhri', 'Dindori', 'Dindoreshwar', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh', 'Dinesh'],
  'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Manipur', 'Moirang', 'Moreh', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Ukhrul'],
  'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Khanapara', 'Meghalaya', 'North Garo Hills', 'Ri-Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'Srimanta Sankaradeva', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
  'Mizoram': ['Aibawk', 'Aizawl', 'Aizawl East', 'Aizawl West', 'Champhai', 'Chhimtuipui', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Mizoram', 'Saichal', 'Saiha', 'Serchhip'],
  'Nagaland': ['Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Nagaland', 'Noklak', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Odisha': ['Angul', 'Balangir', 'Baleshwar', 'Bargarh', 'Bhadrak', 'Bhadrakh', 'Bhanjanagar', 'Bhawanipatna', 'Bhubaneswar', 'Bijaypur', 'Biju Patnaik', 'Bilaspur', 'Bishnupur', 'Bolangir', 'Bolangir', 'Bondo', 'Bongo', 'Bonth', 'Borada', 'Borado', 'Borado', 'Borado', 'Borado', 'Borado', 'Borado', 'Borado', 'Boral', 'Borali', 'Boraludi', 'Borambha', 'Borambhara', 'Borampur', 'Boramram', 'Boramud', 'Boramuka', 'Boramukhalu', 'Borapani', 'Borapara', 'Borapari', 'Borapasa', 'Borapasi', 'Borapatia', 'Borapati', 'Borapatti', 'Boraperi', 'Borapet', 'Borapeth', 'Boraphat', 'Borapira', 'Borapirtha', 'Boraplasa', 'Borapur', 'Borapura', 'Borapuri', 'Borapuram', 'Boraputri', 'Boraputsa', 'Boraradi', 'Boraraha', 'Boraraj', 'Borarajpur', 'Borarajsahi', 'Boraraksala', 'Boraraksali', 'Boraraksalo', 'Boraramapuram', 'Boraramgarh', 'Boraramkhal', 'Borarampur', 'Borarampur', 'Boraramsar', 'Boraramsari', 'Boraramsaro', 'Boraramsari', 'Boraramsarira', 'Boraramsaro', 'Boraramsaroh', 'Boraramsarpur', 'Boraramsarup', 'Boraramsarupalli', 'Boraramsarur', 'Boraramsaruru', 'Boraramsarya', 'Boraramsaryah', 'Boraramsaryali', 'Boraramsaryalu', 'Boraramsaryapalli', 'Boraramsaryapalli', 'Boraramsaryapuram', 'Boraramsaryapuri', 'Boraramsaryara', 'Boraramsarya', 'Boraramsaryti', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Boraramsaryuva', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuddalore', 'Cuttak', 'Debagarh', 'Debagarh', 'Debagarh', 'Deogarh', 'Dhanbad', 'Dhenkanal'],
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Patiala', 'Rupnagar', 'Sangrur', 'Shahid Bhagat Singh Nagar', 'Tarn Taran'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Ganganagar', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jalor', 'Jaswant', 'Jaswanthpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur', 'Jaswantpur'],
  'Sikkim': ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Courtallam', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kancheepuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayurbhanj', 'Nagapattinam', 'Nagercoil', 'Namakkal', 'Nilgiris', 'Panipat', 'Poomulli', 'Pudukkottai', 'Raichur', 'Ramanathapuram', 'Ranipet', 'Reljpur', 'Salem', 'Sambalpur', 'Sangrur', 'Satara', 'Satna', 'Satpur', 'Sawai Madhopur', 'Secunderabad', 'Sehore', 'Seisunda', 'Seitan', 'Sejapur', 'Sejnath', 'Selkhanpur', 'Sempara', 'Sendal', 'Senechal', 'Sengarpur', 'Sengrella', 'Senkalapalli', 'Sennella', 'Sennickuda', 'Sennipore', 'Senpalakunta', 'Senpur', 'Sensanur', 'Sensaram', 'Sensi', 'Sensipur', 'Sensoripeta', 'Sentalakunta', 'Sentard', 'Sentalapai', 'Sentatalakunta', 'Sentatalapalli', 'Sentilakaruppa', 'Sentillakaruppa', 'Sentillakaruppha', 'Sentillapatti', 'Sentillathampatti', 'Sentillatharaka', 'Sentilluppatti', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli', 'Sentilluppalli'],
  'Telangana': ['Adilabad', 'Bheemini', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Kumuram Bheem', 'Mahabubnagar', 'Mahbubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Miryalaguda', 'Nagarkurnool', 'Nalgonda', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Sangareddy', 'Sangareddy', 'Seircilla', 'Serilingampalle', 'Siddipet', 'Singaram', 'Sircilla', 'Suryapet', 'Tandur', 'Tanduru', 'Tandurpet', 'Tandursigala', 'Tandurville', 'Tangadgi', 'Tangipur', 'Tangpur', 'Tanidih', 'Tanikonda', 'Tanikota', 'Tanikuppam', 'Taniki', 'Taniki', 'Taniki', 'Tanilakota', 'Tanneri', 'Tanneribailu', 'Tannikonda', 'Tannikotta', 'Tannikuppam', 'Tannili', 'Tanniligudem', 'Tanniligudem', 'Tanniligudem', 'Tanniligudem', 'Tanniligudem', 'Tanniligudem', 'Tanniligudem', 'Tannilisada', 'Tannilisada', 'Tannilisada', 'Tannilisada', 'Tannilisada', 'Tannilisada', 'Tannilisada', 'Tannilisada', 'Tannilisada', 'Tannilivari', 'Tannilivari', 'Tannilivari', 'Tannilivari', 'Tannilivari', 'Tannilivari', 'Tannilivari', 'Tannilivari', 'Tannilliigudem'],
  'Tripura': ['Dhalai', 'Gomti', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Amritsar', 'Andaman Nicobar Islands', 'Andhra Pradesh', 'Ankleshwar', 'Antardwip', 'Anugul', 'Anuppur', 'Anyar', 'Aonla', 'Apaipur', 'Apatapur', 'Apavandi', 'Apatara', 'Apatyavara', 'Apayapur', 'Apayavara', 'Apchal', 'Apchalpur', 'Apchalvara', 'Apchan', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apchanpur', 'Apatyavara', 'Apayapur', 'Apayavara', 'Auraiya', 'Aurrangabad', 'Aurangabad', 'Aurela', 'Aurevara', 'Auri', 'Aurpur', 'Aurvara', 'Auspati', 'Austhalam', 'Authaipet', 'Authapuram', 'Autura', 'Autuppara', 'Auturaipet', 'Autyapura', 'Auullipet', 'AuUllipur', 'Auzera', 'Auzirpur', 'Auzipur', 'Auzirvar', 'Auzirwara', 'Auzirvara', 'Auzotira', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara', 'Auzotvara'],
  'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Garhwal', 'Hardwar', 'Haridwar', 'Jyotirmath', 'Kumaon', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
  'West Bengal': ['Alipurduar', 'Bankura', 'Bardhaman', 'Birbhum', 'Cooch Behar', 'Darjeeling', 'Dakshin Dinajpur', 'East Medinipur', 'Firozpur', 'Gajol', 'Gangarampur', 'Garwa', 'Haora', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Medinipur', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'North Dinajpur', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur', 'Wazirpur'],
};

export default function NormalUserAccount() {
  const [currentStep, setCurrentStep] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    state: '',
    district: '',
    occupation: '',
    annualIncome: '',
    category: '',
    minorityStatus: '',
    disabilityStatus: '',
    purposes: [],
  });
  const [errors, setErrors] = useState({});

  // Get districts based on selected state
  const getDistrictsByState = (state) => {
    return statesAndDistricts[state] || [];
  };

  const steps = [
    { field: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'Basic Information' },
    { field: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'], section: 'Basic Information' },
    { field: 'state', label: 'State', type: 'select', options: Object.keys(statesAndDistricts), section: 'Basic Information' },
    { field: 'district', label: 'District', type: 'select', options: getDistrictsByState(formData.state), section: 'Basic Information' },
    { field: 'occupation', label: 'Occupation Status', type: 'select', options: ['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Homemaker'], section: 'Employment / Status' },
    { field: 'annualIncome', label: 'Annual Income', type: 'text', placeholder: 'Enter annual income (e.g., 500000)', section: 'Employment / Status' },
    { field: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST'], section: 'Employment / Status' },
    { field: 'minorityStatus', label: 'Minority Status', type: 'select', options: ['Yes', 'No'], section: 'Employment / Status' },
    { field: 'disabilityStatus', label: 'Disability Status', type: 'select', options: ['No Disability', 'Physical Disability', 'Visual Impairment', 'Hearing Impairment', 'Other'], section: 'Employment / Status' },
    { field: 'purposes', label: 'What are you looking for?', type: 'checkbox', options: ['Scholarship', 'Government Scheme', 'Subsidy', 'Loan Support', 'Pension'], section: 'Purpose Selection' },
  ];

  const validateCurrentStep = () => {
    const currentField = steps[currentStep].field;
    const value = formData[currentField];
    const newErrors = {};

    if (currentField === 'purposes') {
      if (!Array.isArray(value) || value.length === 0) {
        newErrors[currentField] = 'Please select at least one purpose';
      }
    } else if (!value || (typeof value === 'string' && value.trim() === '')) {
      newErrors[currentField] = `${steps[currentStep].label} is required`;
    } else if (currentField === 'annualIncome') {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        newErrors[currentField] = 'Please enter a valid annual income';
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

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const updatedPurposes = checked
        ? [...prev.purposes, value]
        : prev.purposes.filter(purpose => purpose !== value);
      return {
        ...prev,
        purposes: updatedPurposes
      };
    });
    if (errors.purposes) {
      setErrors({ ...errors, purposes: '' });
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
    console.log('Normal User Account Data:', formData);
    setSuccessMessage('Profile completed successfully!');
    setFormData({
      dateOfBirth: '',
      gender: '',
      state: '',
      district: '',
      occupation: '',
      annualIncome: '',
      category: '',
      minorityStatus: '',
      disabilityStatus: '',
      purposes: [],
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
      <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600 text-sm">Fill in your details to find matching schemes</p>
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

              {currentStepData.type === 'checkbox' && (
                <div className="space-y-3">
                  {currentStepData.options?.map(option => (
                    <label key={option} className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-blue-50 transition">
                      <input
                        type="checkbox"
                        value={option}
                        checked={formData.purposes.includes(option)}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-800">☐ {option}</span>
                    </label>
                  ))}
                </div>
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
                {isLastStep ? 'Find Matching Schemes' : 'Next'}
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
