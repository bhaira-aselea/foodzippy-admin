import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { api, normalizeVendor } from '@/lib/api';
import MapPreview from '@/components/MapPreview';

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVendor();
    }
  }, [id]);

  const loadVendor = async () => {
    try {
      setIsLoading(true);
      const response = await api.getVendorById(id!);
      setVendor(normalizeVendor(response.data));
    } catch (error) {
      console.error('Failed to load vendor:', error);
      setVendor(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Vendor not found</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{vendor.restaurantName}</h1>
          <p className="text-muted-foreground">Vendor Details</p>
        </div>
        <StatusBadge status={vendor.restaurantStatus} />
        <Button onClick={() => navigate(`/vendor/${id}/edit`)}>Edit Vendor</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Restaurant Information */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Restaurant Information</h2>
            <div className="flex gap-6">
              <img
                src={vendor.restaurantImage}
                alt={vendor.restaurantName}
                className="w-32 h-32 rounded-xl object-cover"
              />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Restaurant Name</p>
                  <p className="font-medium">{vendor.restaurantName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    {vendor.rating}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certificate Code</p>
                  <p className="font-medium">{vendor.certificateCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Time</p>
                  <p className="font-medium">{vendor.approxDeliveryTime}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{vendor.shortDescription}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pure Veg</p>
                  <p className="font-medium">{vendor.isPureVeg ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Popular</p>
                  <p className="font-medium">{vendor.isPopular ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {vendor.categories && vendor.categories.length > 0 ? (
                  vendor.categories.map((cat: string) => (
                    <span key={cat} className="px-3 py-1 text-sm bg-muted rounded-full">
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No categories</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {vendor.services && vendor.services.length > 0 ? (
                  vendor.services.map((service: string) => (
                    <span key={service} className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-full">
                      {service}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No services</span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery & Pricing */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery & Pricing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price for Two</p>
                <p className="font-medium">₹{vendor.approxPriceForTwo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Minimum Order</p>
                <p className="font-medium">₹{vendor.minimumOrderPrice}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Radius</p>
                <p className="font-medium">{vendor.deliveryRadius} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Charge Type</p>
                <p className="font-medium capitalize">{vendor.deliveryChargeType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {vendor.deliveryChargeType === 'fixed' ? 'Fixed Charge' : 'Dynamic Charge'}
                </p>
                <p className="font-medium">
                  ₹{vendor.deliveryChargeType === 'fixed' ? vendor.fixedCharge : vendor.dynamicCharge}/km
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Store Charge</p>
                <p className="font-medium">₹{vendor.storeCharge}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="font-medium">{vendor.commissionRate}%</p>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Location Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Full Address</p>
                <p className="font-medium flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  {vendor.fullAddress}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{vendor.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State</p>
                <p className="font-medium">{vendor.state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pincode</p>
                <p className="font-medium">{vendor.pincode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Landmark</p>
                <p className="font-medium">{vendor.landmark}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latitude</p>
                <p className="font-medium">{vendor.latitude}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longitude</p>
                <p className="font-medium">{vendor.longitude}</p>
              </div>
            </div>
            {/* Map Preview */}
            <MapPreview 
              latitude={vendor.latitude} 
              longitude={vendor.longitude} 
              title={vendor.restaurantName}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Contact</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{vendor.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{vendor.loginEmail}</span>
              </div>
            </div>
          </div>

          {/* Bank & Payment Details */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Bank & Payment</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Bank Name</p>
                <p className="font-medium">{vendor.bankName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bank Code</p>
                <p className="font-medium">{vendor.bankCode || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Recipient Name</p>
                <p className="font-medium">{vendor.recipientName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Account Number</p>
                <p className="font-medium">
                  {vendor.accountNumber ? `****${vendor.accountNumber.slice(-4)}` : 'Not provided'}
                </p>
              </div>
              {vendor.upiId && (
                <div>
                  <p className="text-muted-foreground">UPI ID</p>
                  <p className="font-medium">{vendor.upiId}</p>
                </div>
              )}
              {vendor.paypalId && (
                <div>
                  <p className="text-muted-foreground">PayPal ID</p>
                  <p className="font-medium">{vendor.paypalId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Credentials */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Account Credentials</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Login Email</p>
                <p className="font-medium">{vendor.loginEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Login Password</p>
                <p className="font-medium">••••••••</p>
              </div>
            </div>
          </div>

          {/* Agent Information */}
          {vendor.agentName && (
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">Agent Information</h2>
              <div className="text-sm">
                <p className="text-muted-foreground">Agent Name</p>
                <p className="font-medium">{vendor.agentName}</p>
              </div>
            </div>
          )}

          {/* Submitted Info */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Submission Info</h2>
            <div className="text-sm">
              <p className="text-muted-foreground">Submitted Date</p>
              <p className="font-medium">
                {vendor.createdAt 
                  ? new Date(vendor.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
