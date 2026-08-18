#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ENQUIRY_OPTIONS_PATH = REPO_ROOT / "src/data/enquiryOptions.ts"
OUTPUT_PATH = REPO_ROOT / "src/i18n/menuItemTranslations.ts"


def parse_menu_items(source: str) -> list[tuple[str, str]]:
    start_marker = "export const MENU_ITEMS"
    end_marker = "export const COMMON_PLATE_ITEMS"
    if start_marker not in source or end_marker not in source:
        raise RuntimeError("Could not locate MENU_ITEMS section in enquiryOptions.ts")

    section = source[source.index(start_marker) : source.index(end_marker)]
    pairs = re.findall(r'{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"', section)
    if len(pairs) != 253:
        raise RuntimeError(f"Expected 253 MENU_ITEMS, found {len(pairs)}")
    return pairs


# English dish name -> (Hindi, Marathi)
BY_NAME: dict[str, tuple[str, str]] = {
    "Assorted Soft Drinks": ("मिक्स सॉफ्ट ड्रिंक्स", "मिक्स सॉफ्ट ड्रिंक्स"),
    "Masala Chaas": ("मसाला छाछ", "मसाला ताक"),
    "Fresh Lime Juice": ("ताजा नींबू रस", "ताजा लिंबू रस"),
    "Jal Jeera": ("जलजीरा", "जलजीरा"),
    "Litchi Squash": ("लीची स्क्वैश", "लीची स्क्वॅश"),
    "Kiwi Squash": ("कीवी स्क्वैश", "कीवी स्क्वॅश"),
    "Rose Sharbat": ("गुलाब शरबत", "गुलाब शरबत"),
    "Ice Tea": ("आइस टी", "आइस टी"),
    "Keri Panna": ("कैरी पन्ना", "कैरी पन्हा"),
    "Summer Cool": ("समर कूल", "समर कूल"),
    "Minty Kacchi Keri": ("पुदीना कच्ची कैरी", "पुदिना कच्ची कैरी"),
    "Kala Khatta": ("काला खट्टा", "काळा खट्टा"),
    "Kokam Sharbat": ("कोकम शरबत", "कोकम शरबत"),
    "Lemon Ginger Mojito": ("नींबू अदरक मोजिटो", "लिंबू आलं मोजिटो"),
    "Lemon Litchi Fizz": ("नींबू लीची फिज", "लिंबू लीची फिज"),
    "Blue Lagoon": ("ब्लू लैगून", "ब्लू लैगून"),
    "Mosambi": ("मौसंबी", "मोसंबी"),
    "Pineapple": ("अनानास", "अननस"),
    "Watermelon": ("तरबूज", "कलिंगड"),
    "Orange (Seasonal)": ("संतरा (मौसमी)", "संत्रे (हंगामी)"),
    "Peru Pineapple": ("पेरू अनानास", "पेरू अननस"),
    "Orange Pineapple Ginger": ("संतरा अनानास अदरक", "संत्रे अननस आलं"),
    "Special Cocktail Juice": ("स्पेशल कॉकटेल जूस", "स्पेशल कॉकटेल ज्यूस"),
    "Special Boomerang (Pineapple, Orange & Peru)": ("स्पेशल बूमरैंग (अनानास, संतरा और पेरू)", "स्पेशल बूमरँग (अननस, संत्रे आणि पेरू)"),
    "Special Tulsidhar (Pineapple, Chikku & Tulsi)": ("स्पेशल तुलसीधार (अनानास, चीकू और तुलसी)", "स्पेशल तुलसीधार (अननस, चिकू आणि तुळस)"),
    "Special Golden Punch (Pineapple & Orange)": ("स्पेशल गोल्डन पंच (अनानास और संतरा)", "स्पेशल गोल्डन पंच (अननस आणि संत्रे)"),
    "Special Raja Rani (Pineapple & Rose Syrup)": ("स्पेशल राजा रानी (अनानास और गुलाब सिरप)", "स्पेशल राजा राणी (अननस आणि गुलाब सिरप)"),
    "Special Fruit Punch": ("स्पेशल फ्रूट पंच", "स्पेशल फ्रूट पंच"),
    "Special Virgin Pina Colada": ("स्पेशल वर्जिन पीना कोलाडा", "स्पेशल वर्जिन पीना कोलाडा"),
    "Special Anar Peru Punch": ("स्पेशल अनार पेरू पंच", "स्पेशल डाळिंब पेरू पंच"),
    "Special Thandai": ("स्पेशल ठंडाई", "स्पेशल थंडाई"),
    "Special Mango Smoothie": ("स्पेशल मैंगो स्मूदी", "स्पेशल मँगो स्मूदी"),
    "Special Peach Muskmelon": ("स्पेशल पीच खरबूजा", "स्पेशल पीच खरबूज"),
    "Special Strawberry Colada": ("स्पेशल स्ट्रॉबेरी कोलाडा", "स्पेशल स्ट्रॉबेरी कोलाडा"),
    "Green Salad": ("ग्रीन सलाद", "ग्रीन सॅलड"),
    "Chana Chaat Salad": ("चना चाट सलाद", "चना चाट सॅलड"),
    "Corn Chaat": ("कॉर्न चाट", "कॉर्न चाट"),
    "Beetroot Salad": ("चुकंदर सलाद", "बीटरूट सॅलड"),
    "Russian Salad": ("रशियन सलाद", "रशियन सॅलड"),
    "Mini Samosa": ("मिनी समोसा", "मिनी समोसा"),
    "Moong Dal Bhajia": ("मूंग दाल भजिया", "मूग डाळ भजी"),
    "Dal Wada": ("दाल वडा", "डाळ वडा"),
    "Veg Pakoda": ("वेज पकोड़ा", "वेज पकोडा"),
    "Veg Cutlet": ("वेज कटलेट", "वेज कटलेट"),
    "Vagari Idli": ("वघारी इडली", "फोडणीची इडली"),
    "Masala Idli": ("मसाला इडली", "मसाला इडली"),
    "Idli Podi": ("इडली पोडी", "इडली पोडी"),
    "Khandvi": ("खंडवी", "खंडवी"),
    "Patra": ("पत्रा", "पात्रा"),
    "Dhokla": ("ढोकला", "ढोकळा"),
    "Sandwich Dhokla": ("सैंडविच ढोकला", "सँडविच ढोकळा"),
    "Tiranga Dhokla": ("तिरंगा ढोकला", "तिरंगा ढोकळा"),
    "White Dhokla": ("व्हाइट ढोकला", "व्हाईट ढोकळा"),
    "Khaman": ("खमन", "खमण"),
    "Dahiwada": ("दहीवड़ा", "दहीवडा"),
    "Batata Wada": ("बटाटा वडा", "बटाटा वडा"),
    "Batata Vada": ("बटाटा वडा", "बटाटा वडा"),
    "Mutter Pattis / Karanji": ("मटर पट्टीस / करंजी", "मटार पॅटीस / करंजी"),
    "Corn Pattis": ("कॉर्न पट्टीस", "कॉर्न पॅटीस"),
    "Kothmir Wadi": ("कोथमीर वड़ी", "कोथिंबीर वडी"),
    "Papad Pudina Roll": ("पापड़ पुदीना रोल", "पापड पुदिना रोल"),
    "Veg Spring Roll": ("वेज स्प्रिंग रोल", "वेज स्प्रिंग रोल"),
    "Hara Bhara Kabab": ("हरा भरा कबाब", "हरा भरा कबाब"),
    "Veg Manchurian Dry": ("वेज मंचूरियन ड्राय", "वेज मंचुरियन ड्राय"),
    "Special Veg Potli": ("स्पेशल वेज पोटली", "स्पेशल वेज पोटली"),
    "Veg Gold Coin": ("वेज गोल्ड कॉइन", "वेज गोल्ड कॉइन"),
    "Cheese Corn Ball": ("चीज कॉर्न बॉल", "चीज कॉर्न बॉल"),
    "Cheese Chilly Toast": ("चीज चिली टोस्ट", "चीज चिली टोस्ट"),
    "Veg Timmili Kabab": ("वेज तिमिली कबाब", "वेज तिमिली कबाब"),
    "Corn Karari Tikki": ("कॉर्न करारी टिक्की", "कॉर्न करारी टिक्की"),
    "Kung Pao Potato": ("कुंग पाओ पोटैटो", "कुंग पाओ पोटॅटो"),
    "Veg Crispy": ("वेज क्रिस्पी", "वेज क्रिस्पी"),
    "Veg Finger Schezwan": ("वेज फिंगर शेजवान", "वेज फिंगर शेजवान"),
    "American Roll": ("अमेरिकन रोल", "अमेरिकन रोल"),
    "Cheese Palak Roll": ("चीज पालक रोल", "चीज पालक रोल"),
    "Cigar Roll": ("सिगार रोल", "सिगार रोल"),
    "Salsa Shots": ("साल्सा शॉट्स", "साल्सा शॉट्स"),
    "Paneer Salt-N-Pepper": ("पनीर सॉल्ट एन पेपर", "पनीर सॉल्ट एन पेपर"),
    "Paneer Chilli Dry": ("पनीर चिली ड्राय", "पनीर चिली ड्राय"),
    "Paneer Lifafa": ("पनीर लिफाफा", "पनीर लिफाफा"),
    "Papad Paneer Roll": ("पापड़ पनीर रोल", "पापड पनीर रोल"),
    "Chupurstum Kabab": ("चुपरस्टम कबाब", "चुपरस्टम कबाब"),
    "Special Paneer Pahadi Tikka": ("स्पेशल पनीर पहाड़ी टिक्का", "स्पेशल पनीर पहाडी टिक्का"),
    "Special Paneer Kalimari": ("स्पेशल पनीर कालिमारी", "स्पेशल पनीर कालिमारी"),
    "Special Maladi Paneer Tikka Dry": ("स्पेशल मलाडी पनीर टिक्का ड्राय", "स्पेशल मलाडी पनीर टिक्का ड्राय"),
    "Paneer Gold Coin": ("पनीर गोल्ड कॉइन", "पनीर गोल्ड कॉइन"),
    "Paneer Bhuna Masala": ("पनीर भुना मसाला", "पनीर भुना मसाला"),
    "Paneer Handi": ("पनीर हांडी", "पनीर हांडी"),
    "Paneer Tikka Masala": ("पनीर टिक्का मसाला", "पनीर टिक्का मसाला"),
    "Dhabe Wala Paneer": ("ढाबे वाला पनीर", "ढाबा स्टाइल पनीर"),
    "Palak Paneer (Green)": ("पालक पनीर (ग्रीन)", "पालक पनीर (ग्रीन)"),
    "Paneer Lababdar": ("पनीर लबाबदार", "पनीर लबाबदार"),
    "Paneer Butter Masala": ("पनीर बटर मसाला", "पनीर बटर मसाला"),
    "Paneer Kadai": ("पनीर कड़ाई", "पनीर कढई"),
    "Achari Paneer": ("अचारी पनीर", "अचारी पनीर"),
    "Lasuni Corn Palak Paneer": ("लसूनी कॉर्न पालक पनीर", "लसूणी कॉर्न पालक पनीर"),
    "Bhindi Fry Masala": ("भिंडी फ्राई मसाला", "भेंडी फ्राय मसाला"),
    "Kurkuri Bhindi": ("कुरकुरी भिंडी", "कुरकुरी भेंडी"),
    "Veg Makhanwala": ("वेज मख़नवाला", "वेज मखनवाला"),
    "Veg Hangama": ("वेज हंगामा", "वेज हंगामा"),
    "Chana Masala": ("चना मसाला", "चना मसाला"),
    "Navratan Kurma": ("नवरत्न कुर्मा", "नवरत्न कुर्मा"),
    "Veg Kurma": ("वेज कुर्मा", "वेज कुर्मा"),
    "Veg Kofta": ("वेज कोफ्ता", "वेज कोफ्ता"),
    "Veg Tawa Mehfil": ("वेज तवा महफिल", "वेज तवा महफिल"),
    "Veg Amritsari": ("वेज अमृतसरी", "वेज अमृतसरी"),
    "Veg Diwani Handi": ("वेज दीवानी हांडी", "वेज दिवानी हांडी"),
    "Veg Handi": ("वेज हांडी", "वेज हांडी"),
    "Veg Kolhapuri": ("वेज कोल्हापुरी", "वेज कोल्हापुरी"),
    "Veg Pahadi": ("वेज पहाड़ी", "वेज पहाडी"),
    "Veg Hyderabadi (Green)": ("वेज हैदराबादी (ग्रीन)", "वेज हैदराबादी (ग्रीन)"),
    "Punjabi Saag": ("पंजाबी साग", "पंजाबी साग"),
    "Mix Vegetables": ("मिक्स वेजिटेबल", "मिक्स भाज्या"),
    "Veg Kadai": ("वेज कड़ाई", "वेज कढई"),
    "Dum Aloo Punjabi": ("दम आलू पंजाबी", "दम आलू पंजाबी"),
    "Veg Bhuna Masala": ("वेज भुना मसाला", "वेज भुना मसाला"),
    "Aloo Matar": ("आलू मटर", "बटाटा मटार"),
    "Aloo Flower / Gobi": ("आलू फूलगोभी / गोभी", "बटाटा फ्लॉवर / गोबी"),
    "Methi Matar Malai": ("मेथी मटर मलाई", "मेथी मटार मलाई"),
    "Upma": ("उपमा", "उपमा"),
    "Sheera": ("शीरा", "शिरा"),
    "Poha": ("पोहा", "पोहे"),
    "Khichadi": ("खिचड़ी", "खिचडी"),
    "Idli": ("इडली", "इडली"),
    "Medu Vada": ("मेदु वडा", "मेदू वडा"),
    "Chutney": ("चटनी", "चटणी"),
    "Sambhar": ("सांभर", "सांबार"),
    "Chai": ("चाय", "चहा"),
    "Coffee": ("कॉफी", "कॉफी"),
    "Sabudana Vada": ("साबूदाना वडा", "साबुदाणा वडा"),
    "Sevaiya Upma": ("सेवइया उपमा", "शेवया उपमा"),
    "Dhokli Nu Shaak": ("ढोकली नु शाक", "ढोकळी नु शाक"),
    "Kathiawadi Undhiyu": ("काठियावाड़ी उंधियू", "काठियावाडी उंधियू"),
    "Khichu": ("खीचू", "खीचू"),
    "Dal Dhokli": ("दाल ढोकली", "डाळ ढोकळी"),
    "Sev Tomato Nu Sak": ("सेव टमाटर नु शाक", "सेव टोमॅटो नु शाक"),
    "Bharela Bhinda Nu Shaak": ("भरेला भिंडा नु शाक", "भरेला भेंडा नु शाक"),
    "Green Gujrat": ("ग्रीन गुजरात", "ग्रीन गुजरात"),
    "Ringan Batete Nu Shaak": ("रिंगण बटेटे नु शाक", "रिंगण बटेटे नु शाक"),
    "Gatte Ki Sabzi": ("गट्टे की सब्ज़ी", "गट्टे की भाजी"),
    "Rajasthani Mogar": ("राजस्थानी मोगर", "राजस्थानी मोगर"),
    "Dal Bati Churma": ("दाल बाटी चूरमा", "डाळ बाटी चूरमा"),
    "Rajasthani Kadhi": ("राजस्थानी कढ़ी", "राजस्थानी कढी"),
    "Vadi Ki Sabzi": ("वड़ी की सब्ज़ी", "वडीची भाजी"),
    "Rajasthani Bhindi": ("राजस्थानी भिंडी", "राजस्थानी भेंडी"),
    "Gatte Ka Pulav": ("गट्टे का पुलाव", "गट्ट्यांचा पुलाव"),
    "Hara Kanda Sabzi": ("हरा कांदा सब्ज़ी", "हिरवा कांदा भाजी"),
    "Poori": ("पूरी", "पुरी"),
    "Fulka": ("फुलका", "फुलका"),
    "Roti (Live)": ("रोटी (लाइव)", "पोळी (लाइव्ह)"),
    "Naan (Live)": ("नान (लाइव)", "नान (लाइव्ह)"),
    "Kulcha (Live)": ("कुलचा (लाइव)", "कुलचा (लाइव्ह)"),
    "Paratha (Live)": ("पराठा (लाइव)", "पराठा (लाइव्ह)"),
    "Missi Roti (Live)": ("मिस्सी रोटी (लाइव)", "मिस्सी रोटी (लाइव्ह)"),
    "Stuff Kulcha (Live)": ("स्टफ कुलचा (लाइव)", "स्टफ कुलचा (लाइव्ह)"),
    "Boondi Raita": ("बूंदी रायता", "बुंदी रायता"),
    "Pineapple Raita": ("अनानास रायता", "अननस रायता"),
    "Vegetable Raita": ("वेजिटेबल रायता", "भाजी रायता"),
    "Corn Salad": ("कॉर्न सलाद", "कॉर्न सॅलड"),
    "Chana Salad": ("चना सलाद", "चना सॅलड"),
    "Steam Rice": ("स्टीम राइस", "वाफवलेला भात"),
    "Jeera Rice": ("जीरा राइस", "जिरा राईस"),
    "Peas Pulav": ("मटर पुलाव", "मटार पुलाव"),
    "Tava Pulav": ("तवा पुलाव", "तवा पुलाव"),
    "Veg Biryani": ("वेज बिरयानी", "वेज बिर्याणी"),
    "Gujarati Khichdi": ("गुजराती खिचड़ी", "गुजराती खिचडी"),
    "Dal Fry": ("दाल फ्राई", "डाळ फ्राय"),
    "Dal Tadka": ("दाल तड़का", "डाळ तडका"),
    "Dal Makhani": ("दाल मखनी", "डाळ मखनी"),
    "Gujarati Kadhi (Sweet/Spicy)": ("गुजराती कढ़ी (मीठी/तीखी)", "गुजराती कढी (गोड/तिखट)"),
    "Gujarati Dal (Sweet/Spicy)": ("गुजराती दाल (मीठी/तीखी)", "गुजराती डाळ (गोड/तिखट)"),
    "Punjabi Pakodi Kadhi": ("पंजाबी पकोड़ी कढ़ी", "पंजाबी पकोडी कढी"),
    "Gulab Jamun": ("गुलाब जामुन", "गुलाबजाम"),
    "Special Badam Moongdal Halwa": ("स्पेशल बादाम मूंगदाल हलवा", "स्पेशल बदाम मूगडाळ हलवा"),
    "Special Moongdal Halwa": ("स्पेशल मूंगदाल हलवा", "स्पेशल मूगडाळ हलवा"),
    "Fruit Salad": ("फ्रूट सलाद", "फ्रूट सॅलड"),
    "Gajar Halwa (Seasonal)": ("गाजर हलवा (मौसमी)", "गाजर हलवा (हंगामी)"),
    "Dudhi Halwa": ("दूधी हलवा", "दुधी हलवा"),
    "Special Jalebi with Rabdi": ("स्पेशल जलेबी विद रबड़ी", "स्पेशल जिलेबी विथ रबडी"),
    "Jalebi": ("जलेबी", "जिलेबी"),
    "Special Kesar Phirni": ("स्पेशल केसर फिरनी", "स्पेशल केशर फिरनी"),
    "Shrikhand / Amrakhand": ("श्रीखंड / आम्रखंड", "श्रीखंड / आम्रखंड"),
    "Aam Ras (Seasonal)": ("आम रस (मौसमी)", "आमरस (हंगामी)"),
    "Basundi (All Type)": ("बसुंदी (सभी प्रकार)", "बसुंदी (सर्व प्रकार)"),
    "Rasgulla": ("रसगुल्ला", "रसगुल्ला"),
    "Kala Jamun": ("काला जामुन", "काळा जामुन"),
    "Special Malai Sandwich": ("स्पेशल मलाई सैंडविच", "स्पेशल मलाई सँडविच"),
    "Special Ras Malai": ("स्पेशल रस मलाई", "स्पेशल रस मलाई"),
    "Special Chum Chum": ("स्पेशल चमचम", "स्पेशल चमचम"),
    "Special Strawberry Cream": ("स्पेशल स्ट्रॉबेरी क्रीम", "स्पेशल स्ट्रॉबेरी क्रीम"),
    "Special Chocolate Mousse": ("स्पेशल चॉकलेट मूस", "स्पेशल चॉकलेट मूस"),
    "Special Shahi Tukda": ("स्पेशल शाही टुकड़ा", "स्पेशल शाही तुकडा"),
    "Mohanthal": ("मोहनथाल", "मोहनथाळ"),
    "Black Current": ("ब्लैक करंट", "ब्लॅक करंट"),
    "Chocolate Chips": ("चॉकलेट चिप्स", "चॉकलेट चिप्स"),
    "Guava": ("अमरूद", "पेरू"),
    "Anjeer Badam": ("अंजीर बादाम", "अंजीर बदाम"),
    "Almond": ("बादाम", "बदाम"),
    "Raj Bhog": ("राज भोग", "राजभोग"),
    "Kesar Pista": ("केसर पिस्ता", "केशर पिस्ता"),
    "Pan": ("पान", "पान"),
    "Rose Gulkand": ("रोज गुलकंद", "रोझ गुलकंद"),
    "Kulfi Faluda": ("कुल्फी फालूदा", "कुल्फी फालुदा"),
    "Vanilla": ("वनीला", "व्हॅनिला"),
    "Strawberry": ("स्ट्रॉबेरी", "स्ट्रॉबेरी"),
    "Butter Scotch": ("बटर स्कॉच", "बटर स्कॉच"),
    "Chocolate": ("चॉकलेट", "चॉकलेट"),
    "Vanilla with Choco Sauce": ("वनीला विद चोको सॉस", "व्हॅनिला विथ चोको सॉस"),
    "Malai Kulfi": ("मलाई कुल्फी", "मलाई कुल्फी"),
    "Kulfi Sticky": ("कुल्फी स्टिकी", "कुल्फी स्टिकी"),
    "Pani Puri": ("पानी पुरी", "पाणी पुरी"),
    "Sev Puri": ("सेव पुरी", "सेव पुरी"),
    "Dahi Puri": ("दही पुरी", "दही पुरी"),
    "Papdi Chaat": ("पापड़ी चाट", "पापडी चाट"),
    "Bhel": ("भेल", "भेळ"),
    "Ragda Pattice": ("रगड़ा पैटिस", "रगडा पॅटीस"),
    "Cutori Chaat": ("कटोरी चाट", "कटोरी चाट"),
    "Basket Chaat": ("बास्केट चाट", "बास्केट चाट"),
    "Dahi Wada": ("दही वडा", "दही वडा"),
    "Aloo Tikki Chaat": ("आलू टिक्की चाट", "बटाटा टिक्की चाट"),
    "Dabeli": ("दाबेली", "दाबेली"),
    "Chole Tikki Chaat": ("छोले टिक्की चाट", "छोले टिक्की चाट"),
    "Raj Kachori": ("राज कचौरी", "राज कचोरी"),
    "Samosa Chaat": ("समोसा चाट", "समोसा चाट"),
    "Cheese Chaat": ("चीज चाट", "चीज चाट"),
    "Palak Patta Chaat": ("पालक पत्ता चाट", "पालक पत्ता चाट"),
    "Delhi Chaat": ("दिल्ली चाट", "दिल्ली चाट"),
    "Mumbai Chaat": ("मुंबई चाट", "मुंबई चाट"),
    "Red Sauce Pasta": ("रेड सॉस पास्ता", "रेड सॉस पास्ता"),
    "White Sauce Pasta": ("व्हाइट सॉस पास्ता", "व्हाईट सॉस पास्ता"),
    "Pesto Sauce Pasta": ("पेस्टो सॉस पास्ता", "पेस्टो सॉस पास्ता"),
    "Margherita": ("मार्घेरिटा", "मार्गेरिटा"),
    "Veg Farmyard Pizza": ("वेज फार्मयार्ड पिज्जा", "वेज फार्मयार्ड पिझ्झा"),
    "Paneer Tikka Pizza": ("पनीर टिक्का पिज्जा", "पनीर टिक्का पिझ्झा"),
    "Al Fungi Pizza": ("अल फंगी पिज्जा", "अल फंगी पिझ्झा"),
    "Assorted Dosa / Uttapam": ("मिक्स डोसा / उत्तपम", "मिक्स डोसा / उत्तपम"),
    "Veg Fried Rice": ("वेज फ्राइड राइस", "वेज फ्राईड राईस"),
    "Basil Rice": ("बेसिल राइस", "बेसिल राईस"),
    "Veg Combination Rice": ("वेज कॉम्बिनेशन राइस", "वेज कॉम्बिनेशन राईस"),
    "Veg Schezwan Fried Rice": ("वेज शेजवान फ्राइड राइस", "वेज शेजवान फ्राईड राईस"),
    "Veg Burnt Garlic Rice": ("वेज बर्न्ट गार्लिक राइस", "वेज बर्न्ट गार्लिक राईस"),
    "Veg Hakka Noodles": ("वेज हक्का नूडल्स", "वेज हक्का नूडल्स"),
    "Veg Chilly Garlic Sauce": ("वेज चिली गार्लिक सॉस", "वेज चिली गार्लिक सॉस"),
    "Veg Human Sauce": ("वेज ह्यूमन सॉस", "वेज ह्यूमन सॉस"),
    "Veg Manchurian Gravy": ("वेज मंचूरियन ग्रेवी", "वेज मंचुरियन ग्रेव्ही"),
    "Veg in Black Pepper Sauce": ("वेज इन ब्लैक पेपर सॉस", "वेज इन ब्लॅक पेपर सॉस"),
    "Veg Thai Curry (Red/Green)": ("वेज थाई करी (रेड/ग्रीन)", "वेज थाई करी (रेड/ग्रीन)"),
    "Pav Bhaji Counter": ("पाव भाजी काउंटर", "पाव भाजी काउंटर"),
    "Fruit Counter": ("फ्रूट काउंटर", "फ्रूट काउंटर"),
    "Chole Bhature": ("छोले भटूरे", "छोले भटुरे"),
    "Soup": ("सूप", "सूप"),
}


def ensure_no_latin(text: str) -> None:
    if re.search(r"[A-Za-z]", text):
        raise RuntimeError(f"Latin character found in translation: {text}")


def build_output(menu_items: list[tuple[str, str]]) -> str:
    missing_names = sorted({name for _, name in menu_items if name not in BY_NAME})
    if missing_names:
        print("Missing translations for these names:", file=sys.stderr)
        for name in missing_names:
            print(f" - {name}", file=sys.stderr)
        raise SystemExit(1)

    lines: list[str] = []
    lines.append('import type { Lang } from "./index";')
    lines.append("")
    lines.append("export const MENU_ITEM_TRANSLATIONS: Record<string, Partial<Record<Lang, string>>> = {")

    translated = 0
    for item_id, english_name in menu_items:
        hi, mr = BY_NAME[english_name]
        ensure_no_latin(hi)
        ensure_no_latin(mr)
        lines.append(f'  "{item_id}": {{ hi: "{hi}", mr: "{mr}" }},')
        translated += 1

    lines.append("};")
    lines.append("")
    lines.append(f"// Generated by scripts/build_menu_translations.py ({translated} items)")
    return "\n".join(lines)


def main() -> int:
    source = ENQUIRY_OPTIONS_PATH.read_text(encoding="utf-8")
    menu_items = parse_menu_items(source)
    output = build_output(menu_items)
    OUTPUT_PATH.write_text(output, encoding="utf-8")

    print(f"Generated {OUTPUT_PATH.relative_to(REPO_ROOT)} with {len(menu_items)} translated items.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
