import React from 'react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';
import PageLayout from './PageLayout';
import SEO from './SEO';
import '../App.css';

function ContactPage() {
  return (
    <>
      <SEO
        title="Contact Us | lladlad"
        description="Reach out to lladlad with questions, feedback, or general inquiries."
      />
      <PageLayout mainClassName="page-layout-main">
        <div className="page-shell">
          <ContactForm
            title="Reach Out"
            description="Have questions or feedback? Send us a message and we'll get back to you."
            submissionType="general"
            defaultSubject="General inquiry"
            submitLabel="Send Message"
            messagePlaceholder="Tell us what's on your mind..."
            extraInfo={
              <div className="contact-form-extra">
                <p>
                  Want to write for lladlad?{' '}
                  <Link to="/write-for-lladlad">Submit a writer application</Link>
                </p>
                <p>
                  Looking for logistics or web services?{' '}
                  <Link to="/services">View our services</Link>
                </p>
              </div>
            }
          />
        </div>
      </PageLayout>
    </>
  );
}

export default ContactPage;
