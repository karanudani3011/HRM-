import React from 'react';
import './Legal.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1>PRIVACY POLICY | गोपनीयता नीति</h1>
        <h2>DPDP Act 2023 Compliant | DPDP अधिनियम 2023 अनुपालित</h2>
        <div className="legal-meta">
          <span>Last Updated: 10-May-2026 | अंतिम अपडेट: 10-मई-2026</span>
        </div>
      </div>
      
      <div className="legal-content">
        <section>
          <h3>1. DATA WE COLLECT <br/><small>1. हम कौन सा डेटा एकत्र करते हैं</small></h3>
          <div className="data-table">
            <div className="data-row">
              <strong>Data Source:</strong> JanParichay <br/>
              <strong>Data Points:</strong> Name, DOB, Gender, Photo, Address Token <br/>
              <strong>Purpose:</strong> Identity verification only
            </div>
            <div className="data-row hindi">
              <strong>डेटा स्रोत:</strong> जनपरिचय <br/>
              <strong>डेटा:</strong> नाम, जन्मतिथि, लिंग, फोटो, पता टोकन <br/>
              <strong>उद्देश्य:</strong> केवल पहचान सत्यापन
            </div>
          </div>
          
          <div className="data-table">
            <div className="data-row">
              <strong>Data Source:</strong> You Upload <br/>
              <strong>Data Points:</strong> Degree, NMC Reg No, Live Selfie, Email <br/>
              <strong>Purpose:</strong> Qualification verify + Liveness
            </div>
            <div className="data-row hindi">
              <strong>डेटा स्रोत:</strong> आप द्वारा अपलोड <br/>
              <strong>डेटा:</strong> डिग्री, NMC रजि. नंबर, लाइव सेल्फी, ईमेल <br/>
              <strong>उद्देश्य:</strong> योग्यता सत्यापन + लाइवनेस
            </div>
          </div>

          <div className="data-table">
            <div className="data-row">
              <strong>Data Source:</strong> Auto <br/>
              <strong>Data Points:</strong> IP, Device, Login time <br/>
              <strong>Purpose:</strong> Security + Fraud prevention
            </div>
            <div className="data-row hindi">
              <strong>डेटा स्रोत:</strong> ऑटो <br/>
              <strong>डेटा:</strong> IP, डिवाइस, लॉगिन समय <br/>
              <strong>उद्देश्य:</strong> सुरक्षा + धोखाधड़ी रोकथाम
            </div>
          </div>

          <p className="highlight-box">
            <strong>We DO NOT Collect:</strong> Aadhaar Number, Bank Details, Biometrics except selfie.<br/>
            <strong>हम एकत्र नहीं करते:</strong> आधार नंबर, बैंक विवरण, बायोमेट्रिक्स सेल्फी के अलावा।
          </p>
        </section>

        <section>
          <h3>2. HOW WE USE DATA <br/><small>2. डेटा का उपयोग कैसे करते हैं</small></h3>
          <ul>
            <li><strong>2.1</strong> Verify you are genuine doctor → Issue “Verified ✓” badge<br/>आप वास्तविक डॉक्टर हैं यह सत्यापित करना → "सत्यापित ✓" बैज देना</li>
            <li><strong>2.2</strong> Match you with hospitals + patients<br/>आपको अस्पतालों + रोगियों से मिलाना</li>
            <li><strong>2.3</strong> Legal compliance + NMC record keeping<br/>कानूनी अनुपालन + NMC रिकॉर्ड रखना</li>
            <li><strong>2.4 We DO NOT:</strong> Sell data, send marketing SMS, share with advertisers<br/><strong>हम नहीं करते:</strong> डेटा बेचना, मार्केटिंग SMS भेजना, विज्ञापनदाताओं से साझा करना</li>
          </ul>
        </section>

        <section>
          <h3>3. DATA SHARING <br/><small>3. डेटा साझाकरण</small></h3>
          <p><strong>3.1</strong> Shared only with: a) Hospitals you apply to, b) Patients you consult, c) Govt/Court if legally required.<br/>
          केवल इनके साथ साझा: a) जिन अस्पतालों में आप आवेदन करते हैं, b) जिन रोगियों से परामर्श करते हैं, c) कानूनी रूप से आवश्यक होने पर सरकार/न्यायालय।</p>
          <p><strong>3.2</strong> JanParichay data processed by NIC as per their policy. HRM not liable for NIC data practices.<br/>
          जनपरिचय डेटा NIC द्वारा उनकी नीति के अनुसार प्रोसेस। HRM NIC डेटा प्रथाओं के लिए जिम्मेदार नहीं।</p>
        </section>

        <section>
          <h3>4. DATA STORAGE & SECURITY <br/><small>4. डेटा भंडारण और सुरक्षा</small></h3>
          <p><strong>4.1</strong> Servers: AWS Mumbai, AES-256 encrypted.<br/>
          सर्वर: AWS मुंबई, AES-256 एन्क्रिप्टेड।</p>
          <p><strong>4.2</strong> Retention: Degree 7 years, Selfie 30 days, Logs 180 days, Account data till deletion.<br/>
          प्रतिधारण: डिग्री 7 साल, सेल्फी 30 दिन, लॉग 180 दिन, खाता डेटा हटाने तक।</p>
          <p><strong>4.3</strong> Aadhaar Number: Never stored by HRM or NIC in JanParichay database.<br/>
          आधार नंबर: HRM या NIC द्वारा जनपरिचय डेटाबेस में कभी स्टोर नहीं किया जाता।</p>
          <p><strong>4.4</strong> HRM does not guarantee protection against hacking/viruses but uses reasonable security measures.<br/>
          HRM हैकिंग/वायरस से सुरक्षा की गारंटी नहीं देता लेकिन उचित सुरक्षा उपायों का उपयोग करता है।</p>
        </section>

        <section>
          <h3>5. YOUR RIGHTS - DPDP ACT 2023 <br/><small>5. आपके अधिकार - DPDP अधिनियम 2023</small></h3>
          <p><strong>5.1</strong> Email director@hrmconsultancydoctorschoices.com to: Access, Correct, Delete, Withdraw Consent.<br/>
          एक्सेस, सुधार, हटाने, सहमति वापस लेने के लिए director@hrmconsultancydoctorschoices.com पर ईमेल करें।</p>
          <p><strong>5.2</strong> Withdrawal = Account deactivation. Response within 7 working days.<br/>
          सहमति वापस लेना = खाता निष्क्रिय। 7 कार्य दिवसों में उत्तर।</p>
        </section>

        <section>
          <h3>6. COOKIES <br/><small>6. कुकीज़</small></h3>
          <p><strong>6.1</strong> Only essential cookies for login. No tracking/ads.<br/>
          लॉगिन के लिए केवल आवश्यक कुकीज़। कोई ट्रैकिंग/विज्ञापन नहीं।</p>
        </section>

        <section>
          <h3>7. JANPARICHAY PRIVACY <br/><small>7. जनपरिचय गोपनीयता</small></h3>
          <p><strong>7.1</strong> NIC may collect data as per JanParichay Terms. HRM not liable for NIC data practices.<br/>
          NIC जनपरिचय शर्तों के अनुसार डेटा एकत्र कर सकता है। HRM NIC डेटा प्रथाओं के लिए जिम्मेदार नहीं।</p>
          <p><strong>7.2</strong> Read NIC policy at janparichay.meripehchaan.gov.in.<br/>
          NIC नीति janparichay.meripehchaan.gov.in पर पढ़ें।</p>
        </section>

        <section>
          <h3>8. THIRD-PARTY MATERIAL <br/><small>8. तृतीय-पक्ष सामग्री</small></h3>
          <p><strong>8.1</strong> HRM service may contain links to third-party websites. HRM not responsible for their content.<br/>
          HRM सेवा में तृतीय-पक्ष वेबसाइटों के लिंक हो सकते हैं। HRM उनकी सामग्री के लिए जिम्मेदार नहीं।</p>
        </section>

        <section>
          <h3>9. CHANGES TO PRIVACY POLICY <br/><small>9. गोपनीयता नीति में परिवर्तन</small></h3>
          <p><strong>9.1</strong> HRM may update this policy. Continued use means acceptance.<br/>
          HRM इस नीति को अपडेट कर सकता है। निरंतर उपयोग का अर्थ स्वीकृति है।</p>
        </section>

        <div className="legal-footer">
          <p>© {new Date().getFullYear()} HRM CONSULTANCY DOCTORS CHOICE™ | Rajkot, Gujarat<br/>
          © {new Date().getFullYear()} HRM कंसल्टेंसी डॉक्टर्स चॉइस™ | राजकोट, गुजरात</p>
          <p>Disclaimer: HRM is a technology platform. We do not provide medical advice.<br/>
          अस्वीकरण: HRM एक प्रौद्योगिकी मंच है। हम चिकित्सा सलाह नहीं देते।</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
