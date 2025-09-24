// FILE: src/pages/CoursesPage.jsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, Clock, Users, Star, BookOpen, Filter, Search, 
  Award, CheckCircle, Calendar, Globe, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AnimatedButton } from './ui/animated-button';

interface CoursesPageProps {
  onNavigate: (page: string) => void;
}

// Mock data for courses (no changes here)
const featuredCourses = [
  {
    id: 1,
    title: "Digital Marketing for African Businesses",
    description: "Master digital marketing strategies tailored for African markets and grow your business online.",
    instructor: "Adaora Okafor",
    instructorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b665?w=150",
    price: 69,
    originalPrice: 99,
    rating: 4.9,
    students: 1240,
    duration: "8 weeks",
    lessons: 24,
    level: "Intermediate",
    language: "English",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    skills: ["Social Media Marketing", "Content Strategy", "Analytics", "Brand Building"],
    featured: true,
    bestseller: true
  },
  {
    id: 2,
    title: "Traditional Craft Business Setup",
    description: "Learn how to turn your traditional crafting skills into a profitable business.",
    instructor: "Kwame Asante",
    instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    price: 49,
    rating: 4.8,
    students: 856,
    duration: "6 weeks",
    lessons: 18,
    level: "Beginner",
    language: "English",
    category: "Business",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400",
    skills: ["Business Planning", "Marketing", "Financial Management", "Online Selling"],
    featured: true
  },
  {
    id: 3,
    title: "African Fashion Design Masterclass",
    description: "Explore contemporary African fashion design and build your own fashion brand.",
    instructor: "Amara Okafor",
    instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    price: 89,
    originalPrice: 120,
    rating: 4.7,
    students: 654,
    duration: "10 weeks",
    lessons: 30,
    level: "Advanced",
    language: "English",
    category: "Design",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    skills: ["Fashion Design", "Pattern Making", "Brand Development", "Sustainable Fashion"]
  },
  {
    id: 4,
    title: "Mobile Money & Fintech in Africa",
    description: "Understand the mobile money ecosystem and fintech opportunities across Africa.",
    instructor: "Folake Adebayo",
    instructorImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    price: 79,
    rating: 4.6,
    students: 432,
    duration: "5 weeks",
    lessons: 15,
    level: "Intermediate",
    language: "English",
    category: "Finance",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
    skills: ["Mobile Payments", "Blockchain", "Financial Inclusion", "Regulatory Compliance"]
  },
  {
    id: 5,
    title: "Sustainable Agriculture Techniques",
    description: "Learn modern sustainable farming methods suitable for African climates.",
    instructor: "Dr. Samuel Mwangi",
    instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    price: 55,
    rating: 4.8,
    students: 789,
    duration: "7 weeks",
    lessons: 21,
    level: "Beginner",
    language: "English",
    category: "Agriculture",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    skills: ["Crop Management", "Soil Health", "Water Conservation", "Organic Farming"]
  },
  {
    id: 6,
    title: "African Languages for Business",
    description: "Master key African languages to expand your business opportunities.",
    instructor: "Fatima Hassan",
    instructorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    price: 39,
    rating: 4.5,
    students: 567,
    duration: "12 weeks",
    lessons: 36,
    level: "Beginner",
    language: "Multiple",
    category: "Language",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    skills: ["Swahili", "Hausa", "Business Communication", "Cultural Understanding"]
  }
];

const categories = [
  { id: 'all', name: 'All Courses', count: 156 },
  { id: 'business', name: 'Business & Entrepreneurship', count: 45 },
  { id: 'marketing', name: 'Digital Marketing', count: 32 },
  { id: 'design', name: 'Design & Creative', count: 28 },
  { id: 'finance', name: 'Finance & Fintech', count: 18 },
  { id: 'agriculture', name: 'Agriculture & Farming', count: 15 },
  { id: 'language', name: 'Languages', count: 12 },
  { id: 'technology', name: 'Technology', count: 6 }
];

export function CoursesPage({}: CoursesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const filteredCourses = featuredCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category.toLowerCase() === selectedCategory;
    
    const matchesPrice = priceFilter === 'all' || 
                         (priceFilter === 'free' && course.price === 0) ||
                         (priceFilter === 'under-50' && course.price < 50) ||
                         (priceFilter === '50-100' && course.price >= 50 && course.price <= 100) ||
                         (priceFilter === 'over-100' && course.price > 100);
    
    const matchesLevel = levelFilter === 'all' || course.level.toLowerCase() === levelFilter;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'students':
        return b.students - a.students;
      case 'newest':
        return b.id - a.id;
      default: // featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
    }
  });

  const CourseCard = ({ course, index }: { course: typeof featuredCourses[0]; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      {/* ADDED SUBTLE HOVER EFFECT WRAPPER */}
      <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Course Image */}
          <div className="relative overflow-hidden rounded-t-lg">
            <ImageWithFallback
              src={course.image}
              alt={course.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {course.featured && (
                <Badge className="bg-primary text-white text-xs">Featured</Badge>
              )}
              {course.bestseller && (
                <Badge className="bg-orange-500 text-white text-xs">Bestseller</Badge>
              )}
              {course.originalPrice && (
                <Badge variant="destructive" className="text-xs">
                  -{Math.round((1 - course.price / course.originalPrice) * 100)}%
                </Badge>
              )}
            </div>

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="lg"
                className="rounded-full w-16 h-16 p-0 bg-white/90 hover:bg-white text-primary shadow-lg"
              >
                <Play className="w-6 h-6 ml-1" />
              </Button>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {course.duration}
              </Badge>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category & Level */}
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                {course.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {course.level}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-base mb-2 line-clamp-2 leading-tight">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {course.description}
            </p>

            {/* Instructor */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
                <ImageWithFallback
                  src={course.instructorImage}
                  alt={course.instructor}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-muted-foreground">{course.instructor}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{course.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{course.students.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3" />
                <span>{course.lessons} lessons</span>
              </div>
            </div>

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {course.skills.slice(0, 3).map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {course.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{course.skills.length - 3} more
                </Badge>
              )}
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between mt-auto">
              <div>
                {course.price === 0 ? (
                  <span className="text-lg font-semibold text-green-600">Free</span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-primary">£{course.price}</span>
                    {course.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        £{course.originalPrice}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-2 rounded-full font-bold bg-gradient-to-r from-primary to-primary/80 text-white shadow-xl transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/60 active:scale-95 border-0 text-base"
                style={{ boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10)' }}
              >
                <span>{course.price === 0 ? 'Enroll Free' : 'Enroll Now'}</span>
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* RESPONSIVE FONT SIZES */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Learn from African Experts
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Discover skills, knowledge, and opportunities with courses designed specifically 
              for African entrepreneurs and professionals.
            </p>
            {/* RESPONSIVE BUTTON LAYOUT */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-primary"
              >
                Browse All Courses
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white bg-primary/80 hover:bg-white hover:text-primary transition-colors duration-200"
              >
                Become an Instructor
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-14 bg-muted/30">
        <div className="container mx-auto px-4 relative -mt-24 lg:-mt-28">
           {/* RESPONSIVE GRID FOR STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center text-center">
              <BookOpen className="w-10 h-10 text-primary mb-3" />
              {/* RESPONSIVE FONT SIZES */}
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground mb-1">150+</span>
              <span className="text-base text-muted-foreground font-medium">Courses</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center text-center">
              <Users className="w-10 h-10 text-primary mb-3" />
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground mb-1">12,000+</span>
              <span className="text-base text-muted-foreground font-medium">Students</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center text-center">
              <Award className="w-10 h-10 text-primary mb-3" />
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground mb-1">45+</span>
              <span className="text-base text-muted-foreground font-medium">Instructors</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center text-center">
              <Globe className="w-10 h-10 text-primary mb-3" />
              <span className="text-3xl lg:text-4xl font-extrabold text-foreground mb-1">25+</span>
              <span className="text-base text-muted-foreground font-medium">Countries</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12"/>
              </div>
              {/* RESPONSIVE GRID FOR FILTERS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (<SelectItem key={category.id} value={category.id}>{category.name} ({category.count})</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Price Range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="under-50">Under £50</SelectItem>
                    <SelectItem value="50-100">£50 - £100</SelectItem>
                    <SelectItem value="over-100">Over £100</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Sort By" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="students">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Showing {sortedCourses.length} courses {searchQuery && ` for "${searchQuery}"`}</p>
              {(searchQuery || selectedCategory !== 'all' || priceFilter !== 'all' || levelFilter !== 'all') && (
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setPriceFilter('all'); setLevelFilter('all'); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {sortedCourses.length > 0 ? (
             // ADDED XL GRID FOR WIDE SCREENS
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setPriceFilter('all'); setLevelFilter('all'); }}>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of African professionals and entrepreneurs who are advancing their careers with our expert-led courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary">
                Create Free Account
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Explore Free Courses
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
