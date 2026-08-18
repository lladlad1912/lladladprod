import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ContactForm from './ContactForm';
import PageLayout from './PageLayout';
import SEO from './SEO';
import '../App.css';

function ClientInquiryPage() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || 'logistics';

  return (
    <>
      <SEO
        title="Request Services | lladlad"
        description="Get in touch for logistics and web service solutions tailored to your business."
      />
      <PageLayout mainClassName="page-layout-main">
        <div className="page-shell">
          <ContactForm
            title="Request Our Services"
            description="Tell us about your logistics or web project. We work with businesses that need reliable operations and modern digital solutions."
            submissionType="client-inquiry"
            defaultSubject="Service inquiry"
            submitLabel="Submit Inquiry"
            showCompany
            showPhone
            showServiceType
            initialServiceType={preselectedService}
            messagePlaceholder="Describe your project, timeline, and what you need help with..."
            extraInfo={
              <div className="contact-form-extra">
                <Link to="/services" className="btn btn-secondary">
                  ← Back to Services
                </Link>
              </div>
            }
          />
        </div>
      </PageLayout>
    </>
  );
}

export default ClientInquiryPage;
