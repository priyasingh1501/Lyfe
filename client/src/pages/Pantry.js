import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertTriangle,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Snowflake,
  Utensils,
  Coffee
} from 'lucide-react';
import axios from 'axios';

const Pantry = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [itemFormData, setItemFormData] = useState({
    category: 'fridge',
    subcategory: '',
    itemName: '',
    quantity: 1,
    unit: 'piece',
    lowThreshold: 1,
    notes: ''
  });

  const categories = {
    fridge: {
      label: 'Fridge & Freezer',
      icon: <Snowflake size={20} />,
      subcategories: ['Veggies', 'Fruits', 'Dairy', 'Meat', 'Frozen', 'Beverages']
    },
    essentials: {
      label: 'Essentials',
      icon: <Utensils size={20} />,
      subcategories: ['Masala', 'Oil', 'Atta', 'Rice', 'Dal', 'Grains', 'Condiments']
    },
    snacks_breakfast: {
      label: 'Snacks & Breakfast',
      icon: <Coffee size={20} />,
      subcategories: ['Poha', 'Biscuits', 'Nuts', 'Cereals', 'Tea', 'Coffee', 'Snacks']
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [inventoryRes, summaryRes, lowStockRes] = await Promise.all([
        axios.get('/api/pantry', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/pantry/summary', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/pantry/low-stock', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setInventory(inventoryRes.data);
      setSummary(summaryRes.data);
      setLowStockItems(lowStockRes.data);
    } catch (error) {
      console.error('Error fetching pantry data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingItem) {
        await axios.put(`/api/pantry/${editingItem._id}`, itemFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/pantry', itemFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowAddModal(false);
      setEditingItem(null);
      resetItemForm();
      fetchData();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      category: item.category,
      subcategory: item.subcategory,
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      lowThreshold: item.lowThreshold,
      notes: item.notes
    });
    setShowAddModal(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/pantry/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  const handleOrderedToday = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/pantry/${id}/ordered-today`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error marking item as ordered:', error);
    }
  };

  const resetItemForm = () => {
    setItemFormData({
      category: 'fridge',
      subcategory: '',
      itemName: '',
      quantity: 1,
      unit: 'piece',
      lowThreshold: 1,
      notes: ''
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0C0F]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD200]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0F] text-[#E8EEF2] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFD200] font-oswald tracking-wide mb-2">
          PANTRY MISSION CONTROL
        </h1>
        <p className="text-[#C9D1D9] font-inter">
          Manage your inventory, track supplies, and never run out of essentials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1 mb-6">
        {['overview', 'fridge', 'essentials', 'snacks'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
              activeTab === tab
                ? 'bg-[#FFD200] text-[#0A0C0F]'
                : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
            }`}
          >
            {tab === 'fridge' ? 'Fridge' : tab === 'essentials' ? 'Essentials' : tab === 'snacks' ? 'Snacks' : 'Overview'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Inventory Summary */}
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#3EA6FF]"></div>
              
              <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">
                INVENTORY OVERVIEW
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summary.map((category) => (
                  <div key={category._id} className="bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {categories[category._id]?.icon}
                    </div>
                    <p className="text-sm font-medium text-[#E8EEF2] font-oswald tracking-wide mb-2">
                      {categories[category._id]?.label}
                    </p>
                    <div className="text-lg font-bold text-[#FFD200] font-mono mb-1">
                      {category.totalItems}
                    </div>
                    <p className="text-xs text-[#C9D1D9] font-inter">
                      Total Items
                    </p>
                    {category.lowStockItems > 0 && (
                      <div className="mt-2 text-xs text-[#D64545] font-inter">
                        {category.lowStockItems} low stock
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <div className="bg-[#11151A] border-2 border-[#D64545] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D64545] to-[#FFD200]"></div>
                
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="text-[#D64545]" size={24} />
                  <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">
                    LOW STOCK ALERTS
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockItems.slice(0, 6).map((item) => (
                    <div key={item._id} className="bg-[#0A0C0F] border border-[#D64545] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#E8EEF2] font-oswald tracking-wide">{item.itemName}</p>
                          <p className="text-xs text-[#C9D1D9] font-inter">{item.subcategory}</p>
                        </div>
                        <button
                          onClick={() => handleOrderedToday(item._id)}
                          className="bg-[#D64545] text-[#E8EEF2] px-2 py-1 rounded text-xs hover:bg-[#D64545]/80 transition-colors"
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add Item */}
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">
                  ADD NEW ITEM
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#FFD200] text-[#0A0C0F] px-6 py-3 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
                >
                  ADD INVENTORY ITEM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category-specific tabs */}
        {['fridge', 'essentials', 'snacks'].includes(activeTab) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">
                {categories[activeTab]?.label}
              </h3>
              <button
                onClick={() => {
                  setItemFormData({...itemFormData, category: activeTab});
                  setShowAddModal(true);
                }}
                className="bg-[#FFD200] text-[#0A0C0F] px-4 py-2 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
              >
                ADD ITEM
              </button>
            </div>
            
            {/* Inventory Items */}
            <div className="space-y-4">
              {inventory
                .filter(item => item.category === activeTab)
                .sort((a, b) => a.subcategory.localeCompare(b.subcategory) || a.itemName.localeCompare(b.itemName))
                .map((item) => (
                  <div key={item._id} className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                    <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-[#FFD200] bg-[#2A313A] px-2 py-1 rounded-full font-oswald tracking-wide">
                          {item.subcategory}
                        </span>
                        <span className="font-medium text-[#E8EEF2] font-oswald tracking-wide">{item.itemName}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-oswald tracking-wide ${
                          item.isLow 
                            ? 'bg-[#D64545] text-[#E8EEF2]' 
                            : 'bg-[#3CCB7F] text-[#0A0C0F]'
                        }`}>
                          {item.isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOrderedToday(item._id)}
                          className="bg-[#3EA6FF] text-[#0A0C0F] px-3 py-1 rounded text-xs hover:bg-[#3EA6FF]/80 transition-colors font-medium"
                        >
                          ORDERED TODAY
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1 text-[#C9D1D9] hover:text-[#FFD200] transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-1 text-[#C9D1D9] hover:text-[#D64545] transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[#C9D1D9] font-inter">Quantity</p>
                        <p className="text-[#FFD200] font-mono">{item.quantity} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-[#C9D1D9] font-inter">Threshold</p>
                        <p className="text-[#FFD200] font-mono">{item.lowThreshold}</p>
                      </div>
                      <div>
                        <p className="text-[#C9D1D9] font-inter">Last Ordered</p>
                        <p className="text-[#FFD200] font-mono">{formatDate(item.lastOrdered)}</p>
                      </div>
                      <div>
                        <p className="text-[#C9D1D9] font-inter">Status</p>
                        <div className="flex items-center space-x-1">
                          {item.isLow ? (
                            <XCircle className="text-[#D64545]" size={14} />
                          ) : (
                            <CheckCircle className="text-[#3CCB7F]" size={14} />
                          )}
                          <span className={`text-xs font-oswald tracking-wide ${
                            item.isLow ? 'text-[#D64545]' : 'text-[#3CCB7F]'
                          }`}>
                            {item.isLow ? 'Low Stock' : 'Well Stocked'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {item.notes && (
                      <div className="mt-3 pt-3 border-t border-[#2A313A]">
                        <p className="text-sm text-[#C9D1D9] font-inter">{item.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Category</label>
                <select
                  value={itemFormData.category}
                  onChange={(e) => setItemFormData({...itemFormData, category: e.target.value, subcategory: ''})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                >
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>{category.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Subcategory</label>
                <select
                  value={itemFormData.subcategory}
                  onChange={(e) => setItemFormData({...itemFormData, subcategory: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                >
                  <option value="">Select subcategory</option>
                  {categories[itemFormData.category]?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemFormData.itemName}
                  onChange={(e) => setItemFormData({...itemFormData, itemName: e.target.value})}
                  placeholder="e.g., Tomatoes, Basmati Rice, Green Tea"
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({...itemFormData, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Unit</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({...itemFormData, unit: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="g">Gram</option>
                    <option value="l">Liter</option>
                    <option value="ml">Milliliter</option>
                    <option value="pack">Pack</option>
                    <option value="bottle">Bottle</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={itemFormData.lowThreshold}
                  onChange={(e) => setItemFormData({...itemFormData, lowThreshold: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Notes</label>
                <textarea
                  value={itemFormData.notes}
                  onChange={(e) => setItemFormData({...itemFormData, notes: e.target.value})}
                  placeholder="Any additional notes about this item..."
                  rows="3"
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                />
              </div>
              
              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#FFD200] text-[#0A0C0F] px-4 py-2 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
                >
                  {editingItem ? 'Update Item' : 'Save Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    resetItemForm();
                  }}
                  className="flex-1 bg-[#2A313A] text-[#C9D1D9] px-4 py-2 rounded-lg hover:bg-[#2A313A]/80 transition-colors font-medium font-oswald tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pantry;
