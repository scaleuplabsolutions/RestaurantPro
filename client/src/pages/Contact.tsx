import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ContactForm from "@/components/ContactForm";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";

export default function Contact() {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['/api/locations'],
  });

  return (
    <Layout>
      <Helmet>
        <title>Contact Us - Paul's Restaurant</title>
        <meta name="description" content="Get in touch with Paul's Restaurant. Find our locations, contact information, and send us a message." />
        <meta property="og:title" content="Contact Us - Paul's Restaurant" />
        <meta property="og:description" content="Get in touch with Paul's Restaurant. Find our locations, contact information, and send us a message." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350" />
      </Helmet>
      
      <div className="p-4">
        <h2 className="heading text-2xl font-semibold text-neutral-900">Contact Us</h2>
        
        <div className="mt-4 rounded-lg overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350" 
            alt="Restaurant exterior" 
            className="w-full h-48 object-cover" 
          />
        </div>
        
        <div className="mt-5 space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Our Locations</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {locations && locations.map((location: any) => (
                  <div key={location.id} className="flex gap-3">
                    <div className="text-primary">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-neutral-600">{location.address}</p>
                      <p className="text-sm text-neutral-600">Open: {location.openingHours}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Contact Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Phone</p>
                  <p className="font-medium">(123) 456-7890</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="font-medium">contact@paulsrestaurant.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Website</p>
                  <p className="font-medium">www.paulsrestaurant.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Send Us a Message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
