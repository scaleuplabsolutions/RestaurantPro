import Layout from "@/components/Layout";
import ReservationForm from "@/components/ReservationForm";
import { Helmet } from "react-helmet";

export default function Reservation() {
  return (
    <Layout>
      <Helmet>
        <title>Reserve a Table - Paul's Restaurant</title>
        <meta name="description" content="Book a table at Paul's Restaurant. Make reservations for your special occasions or casual dining." />
        <meta property="og:title" content="Reserve a Table - Paul's Restaurant" />
        <meta property="og:description" content="Book a table at Paul's Restaurant. Make reservations for your special occasions or casual dining." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350" />
      </Helmet>
      
      <div className="p-4">
        <h2 className="heading text-2xl font-semibold text-neutral-900">Make a Reservation</h2>
        
        <div className="mt-4 rounded-lg overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350" 
            alt="Restaurant interior dining area" 
            className="w-full h-48 object-cover" 
          />
        </div>
        
        <div className="mt-5">
          <ReservationForm />
        </div>
      </div>
    </Layout>
  );
}
