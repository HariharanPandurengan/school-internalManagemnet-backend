const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express()
app.use(cors());
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/hathy');
// mongodb+srv://hariharanpandurengan:vIPYwWog8QA2ybiV@hathy.qyze8zy.mongodb.net/hathy?retryWrites=true&w=majority&appName=hathy


const db = mongoose.connection;
// Check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
    console.error(err);
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hariharanmahi2002@gmail.com', 
      pass: 'xten asqy votr yjgn' 
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../Frontend/public/Images/teachers') 
    },
    filename: function (req, file, cb) {
        // Use a unique filename for the uploaded file (you can customize this logic as needed)
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

const storageStudent = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../Frontend/public/Images/students') 
    },
    filename: function (req, file, cb) {
        // Use a unique filename for the uploaded file (you can customize this logic as needed)
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const uploadStudent = multer({ storage: storageStudent });

// Function to hash the password
const hashPassword = async (password) => {
    try {
        const saltRounds = 10; // Number of salt rounds for bcrypt hashing
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password');
    }
};

// Function to compare the password with its hash
const comparePassword = async (password, hashedPassword) => {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        throw new Error('Error comparing password');
    }
};
   
    const adminSchema = new mongoose.Schema({
        name: String,
        email: String,
        password: String
    }, { collection: 'Admin' }); 
    // Define a model
    const AdminModel = mongoose.model('Admin', adminSchema);
 
    const teacherSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    image:String,
    teacherProfile : Object,
    classTeacher : String,
    deleted: String
    }, { collection: 'Teachers' }); 
    // Define a model
    const TeacherModel = mongoose.model('Teacher', teacherSchema);

    const teacherLogSchema = new mongoose.Schema({
        email: String,
        purpose: String,
        date : String,
        time: String
        }, { collection: 'TeachersLogData' });  
    // Define a model
    const TeacherLogModel = mongoose.model('TeacherLogdata', teacherLogSchema);

    const studentSchema = new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        rollno : String,
        std:String,
        image:String,
        section:String,
        className : String,
        classTeacher : String,
        createdDate : String,
        createdBy : String,
        deleted: String,
        studentProfile : Object,
        ttNot : String,
        exttNot : String,
        }, { collection: 'Students' });  
    // Define a model
    const StudentModel = mongoose.model('Students', studentSchema);

    const timetable = new mongoose.Schema({
        teacherEmail: String,
        timetable : Object,
        }, { collection: 'Timetable' });  
    // Define a model
    const TimetableModel = mongoose.model('timetable', timetable);
   
    const Attendance = new mongoose.Schema({
        stuEmail: String,
        className : String,
        month : String,
        att : Object
        }, { collection: 'Attendance' });  
    // Define a model
    const AttendanceModel = mongoose.model('Attendance', Attendance);

    const Result = new mongoose.Schema({
        stuEmail: String,
        examName : String,
        result : Object,
        resNot : String
        }, { collection: 'Result' });  
    // Define a model
    const ResultModel = mongoose.model('Result', Result);

    const ExamTimetable = new mongoose.Schema({
        classTeacher: String,
        examName : String,
        subName : Object,
        subDate : Object,
        }, { collection: 'ExamTimetable' });  
    // Define a model
    const ExamTimetableModel = mongoose.model('ExamTimetable', ExamTimetable);

    const Classes = new mongoose.Schema({
        className : String,
        classTeacher: String,
        students : Object
        }, { collection: 'Classes' });  
    // Define a model
    const ClassesModel = mongoose.model('Classes', Classes);

    const Homework = new mongoose.Schema({
        className : String,
        date : String,
        homework : String,
        }, { collection: 'Homework' });  
    // Define a model
    const HomeworkModel = mongoose.model('Homework', Homework);

        app.post('/adminLogin' ,async (req, res) =>{

            const { email, password } = req.body;
            const user = await AdminModel.findOne({ email: email })
            
            if(user){
                const isMatch = await comparePassword(password, user.password);
                if (isMatch) {
                    res.json({ name: user.name ,email : user.email });
                } else {
                    res.json(false);
                }
            }
            else{
                res.json(false);
            }
            
        });

        app.post('/createTeacher', async (req, res) => {

            const { name, email, password } = req.body;

            const user = await TeacherModel.findOne({ email: email });

            if (user) {
                res.json({ message: 'Email already exist' });
            } else {
                const hashedPassword = await hashPassword(password);

                const newTeacher = new TeacherModel({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    image : '',
                    teacherProfile : {none : ''},
                    deleted : '0'
                });
    
                newTeacher.save()
                .then(() => {
                    res.json({ message: 'Teacher added successfully' });
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
            }

        });

        
        app.post('/teacherLogin', async (req, res) => {
            const { email, password } = req.body;
        
            try {
                // Find user with hashed password
                const user = await TeacherModel.findOne({ email: email});

                const isnotdelted = await TeacherModel.findOne({ email: email , deleted : '0'});
                
                if (user) {
                    if(!isnotdelted){
                        res.json({ message: 'You are deleted by admin' });
                    }
                    else{
                        const isMatch = await comparePassword(password, user.password);
                        if (isMatch) {
                            res.json({ userFound: true, name: user.name, email: user.email });
                        } else {
                            res.json(false);
                        }
                    }
                } else {
                    res.json({ message: 'Email not found' });
                }

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getTeachers', async (req, res) => {
            try {
                const user = await TeacherModel.find({deleted : '0'}, 'name email -_id');
                res.json({user})            
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/getTeacherDetail/:email', async (req, res) => {
            const email = req.params.email;
            try {
                const user = await TeacherModel.find({ email: email }).select('-password');
                res.json({user})            
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/insertTeacherLogData', async (req, res) => {

            const { email , currentpurpose , currentDate, Currenttime } = req.body;

                const newTeacherLog = new TeacherLogModel({
                    email: email,
                    purpose: currentpurpose,
                    date : currentDate,
                    time: Currenttime,
                });
    
                newTeacherLog.save()
                .then(() => {
                    res.json({ message: 'Teacher log added successfully' });
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
    
        });

        app.get('/getTeacherLogData/:email', async (req, res) => {
            const currentDate = new Date();
            let day = currentDate.getDate(); // Get the day of the month (1-31)
            if (day < 10) {
                day = '0' + day;
            }
            let month = currentDate.getMonth() + 1; // Get the month (0-11), add 1 to get the correct month number
            if (month < 10) {
                month = '0' + month;
            }
            const year = currentDate.getFullYear(); // Get the full year (YYYY)
        
            const formattedDate = `${day}/${month}/${year}`;

            const email = req.params.email;
            try {
                const user = await TeacherLogModel.find({ email: email ,date:formattedDate });
                res.json({user})            
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/updateTeachersDetails' , async (req, res) => {
            try {
                const { email , teacherDetails } = req.body;
                    await TeacherModel.updateOne(
                        { email: email },
                        { $set: { teacherProfile: teacherDetails } }
                    );
                    res.json({ message: 'Teacher details updated successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/updateTeachersImage', upload.single('image') , async (req, res) => {
            try {
                const { email } = req.body;
                 const imagepath = req.file.path;
                 
                    await TeacherModel.updateOne(
                        { email: email },
                        { $set: { image: imagepath } }
                    );
                    res.json({ message: 'Teacher Image updated successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getTeacherLogDatafromAdmin/:email/:dd/:mm/:yyyy', async (req, res) => {      
            const email = req.params.email;
            const selectedDate = req.params.dd+'/'+req.params.mm+'/'+req.params.yyyy;
            try {
                const user = await TeacherLogModel.find({ email: email , date:selectedDate });
                res.json({user})            
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        
        app.post('/deleteTeacher', async (req, res) => {
            try {
                const { email } = req.body;
                 
                    await TeacherModel.updateOne(
                        { email: email },
                        { $set: { deleted : '1' } }
                    );
                    res.json({ message: 'Teacher deleted successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        
        app.post('/createStudent', async (req, res) => {

            const { name, email, password , rollno , cbEmail ,std ,section} = req.body;

            const user = await StudentModel.findOne({ email: email });

            const currentDate = new Date();
            let day = currentDate.getDate();
            if(day < 10){
                day = '0'+day
            }
            let month = currentDate.getMonth() + 1; // Get the month (0-11), add 1 to get the correct month number
            if(month < 10){
                month = '0'+month
            }
            let year = currentDate.getFullYear(); 

            const formattedDate = `${day}/${month}/${year}`;

            if (user) {
                res.json({ message: 'Email already exist' });
            } else {
                const hashedPassword = await hashPassword(password);

                const newTeacher = new StudentModel({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    rollno : rollno,
                    std:std,
                    section:section,
                    classTeacher : '',
                    className : '',
                    createdDate : formattedDate,
                    createdBy : cbEmail,
                    deleted: '0',
                    studentProfile : {},
                    ttNot : '0',
                    exttNot : '0',
                });
    
                newTeacher.save()
                .then(() => {
                    res.json({ message: 'Student added successfully' });
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
            }

        });

        app.post('/updateClassTeacher', async (req, res) => {
            try {
                const { email , ctEmail } = req.body;

                    const user = await StudentModel.findOne({ email: email , deleted : '0'});

                    if(user){
                        await StudentModel.updateOne(
                            { email: email , deleted : '0'},
                            { $set: { classTeacher: ctEmail } }
                        );
                        res.json({ message: 'Student added to class successfully' });
                    }
                    else{
                        res.json({ message: 'This student was deleted by admin' });
                    }
                    

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getStudentDetail/:email', async (req, res) => {
            const email = req.params.email;
            try {
                const user = await StudentModel.find({ email: email }).select('-password');
                res.json({user})            
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/updateStudentDetails' , async (req, res) => {
            try {
                const { email , studentDetails } = req.body;
                    await StudentModel.updateOne(
                        { email: email },
                        { $set: { studentProfile : studentDetails } }
                    );
                    res.json({ message: 'Student details updated successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/updateStudentsImage', uploadStudent.single('image') , async (req, res) => {
            try {
                const { email } = req.body;
                 const imagepath = req.file.path;
                 
                    await StudentModel.updateOne(
                        { email: email },
                        { $set: { image: imagepath } }
                    );
                    res.json({ message: 'Student Image updated successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });


        app.get('/getStudentsForClassTeachers/:email', async (req, res) => {      
            const email = req.params.email;
            try {
                const user = await StudentModel.find({ classTeacher : email , deleted : '0'});
                res.json({user})            
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/searchStudent/:email', async (req, res) => {      
            const email = req.params.email;
            try {
                const user = await StudentModel.findOne({ email : email });
                if(!user){
                    res.json({ message: 'Student not found' });
                }
                else{
                    res.json({user})
                }
                 

            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/studentLogin', async (req, res) => {
            const { email, password } = req.body;
        
            try {
                // Find user with hashed password
                const user = await StudentModel.findOne({ email: email });
        
                if (user) {
                    const isMatch = await comparePassword(password, user.password);
                    if (isMatch) {
                        res.json({ userFound: true, name: user.name, email: user.email });
                    } else {
                        res.json(false);
                    }
                } else {
                    res.json(false);
                }
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/teacherTimetable', async (req, res) => {
            try {
                const { teacherEmail , timetable } = req.body;

                const user = await TimetableModel.findOne({ teacherEmail: teacherEmail });
                const StuDet = await StudentModel.find({ classTeacher: teacherEmail });

                for (const item of StuDet) {

                    await StudentModel.updateOne(
                        { email: item.email },
                        { $set: {  ttNot : '1' } }
                    );      
                    
                     // Email content
                     const mailOptions = {
                        from: 'hariharanmahi2002@gmail.com',
                        to: item.email,
                        subject: 'Class TimeTable Updated',
                        text: 'Hello, this is a test email from Node.js using nodemailer!'
                    };
                    
                    // Send email
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                        console.error(error);
                        } 
                    });
                }

                if(user){
                    await TimetableModel.updateOne(
                        { teacherEmail: teacherEmail },
                        { $set: { timetable: timetable } }
                    );

                    res.json({ message: 'Timetable Updated Successfully' });
                }
                else{
                    const tt = new TimetableModel({
                        teacherEmail: teacherEmail,
                        timetable: timetable,
                    });
        
                    tt.save()

                    res.json({ message: 'Timetable Updated Successfully' });
                }  

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getTimetable/:email', async (req, res) => {
            const email = req.params.email;
            try {
                const tt = await TimetableModel.find({ teacherEmail: email });
             
                    res.json({tt})  
                        
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/removeStudent', async (req, res) => {
            try {
                const { email } = req.body;

                await StudentModel.updateOne(
                    { email: email },
                    { $set: {  classTeacher : '' , className : ''} }
                );
                res.json({ message: 'Student removed successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        
        app.post('/deleteStudent', async (req, res) => {
            try {
                const { email } = req.body;

                await StudentModel.updateOne(
                    { email: email },
                    { $set: { classTeacher : '' ,  deleted : '1' } }
                );
                res.json({ message: 'Student deleted successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/retrieveStudent', async (req, res) => {
            try {
                const { email } = req.body;

                await StudentModel.updateOne(
                    { email: email },
                    { $set: {  deleted : '0' } }
                );
                res.json({ message: 'Student retrieved successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getStud/:email', async (req, res) => {      
            const email = req.params.email;
            try {
                const user = await StudentModel.findOne({ email : email });
                if(!user){
                    res.json({ message: 'Student not found' });
                }
                else{
                    res.json({user})
                }
                 

            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/StuAttendance' , async (req, res) => {
            try {
                const { className , month , att } = req.body;

                for (let key in att) {
                    const user = await AttendanceModel.findOne({ stuEmail : key+'.com' });
                    if(user){
                        await AttendanceModel.updateOne(
                            { stuEmail : key+'.com' },
                            { $set: { att: att[key] } }
                        );
                       
                    }
                    else{
                        const attendance = new AttendanceModel({
                            stuEmail: key+'.com',
                            className: className,
                            month: month,
                            att: att[key]
                        });
            
                        attendance.save()
                        
                    } 
                } 
                res.json({ message: 'Saved Successfully' });

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/getStuAttendance' , async (req, res) => {
            try {
                const { stuEmails , month } = req.body;

                const user = {att : {}}

                for (const email of stuEmails) {
                    const stuAtt = await AttendanceModel.findOne({ stuEmail : email , month : month});
                    if(stuAtt){
                        user.att[email.slice(0, -4)] = stuAtt.att
                    }
                }

                if(Object.values(user.att).length !== 0){
                    res.json({user})
                }
                else{
                    res.json({ message: 'no data' });
                } 

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/getInduvidualStuAttendance' , async (req, res) => {
            try {
                const { month , stuEmail } = req.body;

                const user = await AttendanceModel.findOne({ stuEmail : stuEmail+'.com' , month : month });

                if(user){
                    const Attendance = user.att
                    res.json({Attendance})
                }
                else{
                    res.json({ message: 'no stu data' });
                }     

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/insertUpdateResult' , async (req, res) => {
            try {
                const { examName , result } = req.body;
               
                for (let key in result) {

                    const user = await ResultModel.findOne({ stuEmail : key+'.com' });
                    if(user){
                        await ResultModel.updateOne(
                            { stuEmail : key+'.com' },
                            { $set: { examName: examName , result: result[key] , resNot : '1'} }
                        );

                        function compareObjects(obj1, obj2) {
                           
                            const keys1 = Object.keys(obj1);
                            const keys2 = Object.keys(obj2);
                        
                            if (keys1.length !== keys2.length) {
                                return false;
                            }
                        
                            for (let key of keys1) {
                                if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
                                    return false;
                                }
                            }
                        
                            return true;
                        }
                        
                        if(!compareObjects(result[key],user.result)){
                            // Email content
                            const mailOptions = {
                                from: 'hariharanmahi2002@gmail.com',
                                to: key+'.com',
                                subject: 'Result Updated For '+examName,
                                text: 'Hello, this is a test email from Node.js using nodemailer!'
                            };
                            
                            // Send email
                            transporter.sendMail(mailOptions, function(error, info){
                                if (error) {
                                console.error(error);
                                } 
                            });
                        }
                    }
                    else{
                        const stdresult = new ResultModel({
                            stuEmail: key+'.com',
                            examName: examName,
                            result : result[key],
                            resNot : '1'
                        });
            
                        stdresult.save()

                         // Email content
                        const mailOptions = {
                            from: 'hariharanmahi2002@gmail.com',
                            to: key+'.com',
                            subject: 'Result Updated For '+examName,
                            text: 'Hello, this is a test email from Node.js using nodemailer!'
                        };
                        
                        // Send email
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                            console.error(error);
                            } 
                        });
                    }  
                   
                }
                res.json({ message: 'Result Saved Successfully' });
                 

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/getresultforTeacher', async (req, res) => {      
            
            try {
                const { stuEmails } = req.body;

                const user = {result : {}}

                for (const email of stuEmails) {
                    const stuRes = await ResultModel.findOne({ stuEmail: email });
                    if(stuRes){
                        user.result[email.slice(0, -4)] = stuRes.result
                    }
                }

                if(Object.values(user.result).length !== 0){
                    res.json({user})
                }
                else{
                    res.json({ message: 'Student not found' });
                }
                 

            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/getresultforStudents/:email', async (req, res) => {      
            const email = req.params.email;
           
            try {
                const user = await ResultModel.findOne({ stuEmail : email });

                if(user){
                    
                    const resAndExamName = {
                        result : user.result,
                        examName : user.examName
                    }
                    res.json({ StudentResult : resAndExamName });
                }
                else{
                    res.json({ message: 'result not found' });
                }
                 

            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/insertUpdateExamTimetable' , async (req, res) => {
            try {
                const { ctEmail , examName , subName , subDate } = req.body;

                const user = await ExamTimetableModel.findOne({ classTeacher : ctEmail });
                const StuDet = await StudentModel.find({ classTeacher: ctEmail });
                for (const item of StuDet) {
                    await StudentModel.updateOne(
                        { email: item.email },
                        { $set: {  exttNot : '1' } }
                    );   
                        // Email content
                    const mailOptions = {
                        from: 'hariharanmahi2002@gmail.com',
                        to: item.email,
                        subject: 'Exam TimeTable Updated For '+examName,
                        text: 'Hello, this is a test email from Node.js using nodemailer!'
                    };
                    
                    // Send email
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                        console.error(error);
                        } 
                    });               
                }
                if(user){
                    await ExamTimetableModel.updateOne(
                        { classTeacher : ctEmail },
                        { $set: { examName: examName , subName : subName , subDate : subDate } }
                    );
                    res.json({ message: 'Saved Successfully' });
                }
                else{
                    const extt = new ExamTimetableModel({
                        classTeacher: ctEmail,
                        examName: examName,
                        subName : subName,
                        subDate : subDate,
                    });
        
                    extt.save()
                   
                    res.json({ message: 'Saved Successfully' });
                }    

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getEttforTeacher/:email', async (req, res) => {      
            const email = req.params.email;
            try {
                const user = await ExamTimetableModel.findOne({ classTeacher : email });

                if(!user){
                    res.json({ message: 'TT Not Found' });
                }
                else{
                    res.json({user})
                }
                 

            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/getClassforTeacher', async (req, res) => {      
            
            try {
                const classesList = await ClassesModel.find();

                if(classesList.length === 0){
                    res.json({ message: 'no classes created' });
                }
                else{
                    res.json({classesList})
                }
                 

            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/createClass' , async (req, res) => {
            try {
                const { className } = req.body;

                const user = await ClassesModel.findOne({ className : className });

                if(user){
                    res.json({ message: 'class already exist' });
                }
                else{
                    const newClass = new ClassesModel({
                        className: className,
                        classTeacher: '',
                        students : {},
                    });
        
                    newClass.save()
                    res.json({ message: 'Class Created Successfully' });
                }    

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/updateClassTeacherforclass' , async (req, res) => {
            try {
                const { ctEmail , className} = req.body;

                    await ClassesModel.updateOne(
                        { className : className },
                        { $set: { classTeacher: ctEmail } }
                    );
                    res.json({ message: 'Now you are the class teacher' });   

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getClassDetailsforTeacher/:className', async (req, res) => {      
            const className = req.params.className;
            try {
                const user = await ClassesModel.findOne({ className : className });
                res.json({user})
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/updateClassNameforStudent' , async (req, res) => {
            try {
                const { stuEmail , className } = req.body;

                    const user = await ClassesModel.findOne({ className : className });

                    await StudentModel.updateOne(
                        { email : stuEmail },
                        { $set: { className: className , classTeacher : user.classTeacher} }
                    );

                    res.json({ message: 'stu class name changed' });   

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getStudentsForClass/:className', async (req, res) => {      
            const className = req.params.className;
            try {
                const user = await StudentModel.find({ className : className });
                res.json({user})
            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/insertUpdateHomework' , async (req, res) => {
            try {
                const { className , homework } = req.body;

                    const cn = await HomeworkModel.findOne({ className : className });
                    const date = new Date;
                    const format = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`

                    if(cn){
                        await HomeworkModel.updateOne(
                            { className : className },
                            { $set: { date : format, homework: homework } }
                        );
                    }
                    else{
                        const hw = new HomeworkModel({
                            className: className,
                            date : format,
                            homework: homework,
                        });
            
                        hw.save()
                    }

                    res.json({ message: 'hw updated successfully' });   

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getHomework/:className', async (req, res) => {      
            const className = req.params.className;
            try {
                const hw = await HomeworkModel.find({ className : className });
                if(hw){
                    res.json({hw})
                }
                else{
                    res.json({ message: 'No hw found' });
                }
            } catch (error) {
                console.error('Error fetching homework:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/adminPasswordCheck' ,async (req, res) =>{

            const { email, password } = req.body;
            const user = await AdminModel.findOne({ email: email })
            
            const isMatch = await comparePassword(password, user.password);

            if (isMatch) {
                res.json({ message: 'Password matched' });
            } else {
                res.json(false);
            }
            
        });

        app.post('/adminChangePassword' , async (req, res) => {
            try {
                const { email , password } = req.body;

                    const hashedPassword = await hashPassword(password);

                    await AdminModel.updateOne(
                        { email : email },
                        { $set: { password : hashedPassword } }
                    );
                    
                    res.json({ message: 'Password Changed successfully' });   

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/teacherPasswordCheck' ,async (req, res) =>{

            const { email, password } = req.body;
            const user = await TeacherModel.findOne({ email: email })
            
            const isMatch = await comparePassword(password, user.password);

            if (isMatch) {
                res.json({ message: 'Password matched' });
            } else {
                res.json(false);
            }
            
        });

        app.post('/teacherChangePassword' , async (req, res) => {
            try {
                const { email , password } = req.body;

                    const hashedPassword = await hashPassword(password);

                    await TeacherModel.updateOne(
                        { email : email },
                        { $set: { password : hashedPassword } }
                    );
                    
                    res.json({ message: 'Password Changed successfully' });   

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/studentPasswordCheck' ,async (req, res) =>{

            const { email, password } = req.body;
            const user = await StudentModel.findOne({ email: email })
            
            const isMatch = await comparePassword(password, user.password);

            if (isMatch) {
                res.json({ message: 'Password matched' });
            } else {
                res.json(false);
            }
            
        });

        app.post('/studentChangePassword' , async (req, res) => {
            try {
                const { email , password } = req.body;

                    const hashedPassword = await hashPassword(password);

                    await StudentModel.updateOne(
                        { email : email },
                        { $set: { password : hashedPassword } }
                    );
                    
                    res.json({ message: 'Password Changed successfully' });   

            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/getStudentNotifications/:email', async (req, res) => {      
            const email = req.params.email;
            try {
                const resNot = await ResultModel.findOne({ stuEmail : email , resNot : '1' });
                const ettNot = await StudentModel.findOne({ email: email , exttNot : '1'})
                const ttNot = await StudentModel.findOne({ email: email , ttNot: '1'});

                if(resNot && ettNot && ttNot){
                    res.json({ message: 'Result,Exam Time Table and Class Time Table updated' });
                }
                else if(resNot && ettNot){
                    res.json({ message: 'Result and Exam Time Table updated' });
                }
                else if(resNot && ttNot){
                    res.json({ message: 'Result and Class Time Table updated' });
                }
                else if(ettNot && ttNot){
                    res.json({ message: 'Exam Time Table and Class Time Table updated' });
                }
                else if(resNot){
                    res.json({ message: 'Result updated' });
                }
                else if(ettNot){
                    res.json({ message: 'Exam Time Table updated' });
                }
                else if(ttNot){
                    res.json({ message: 'Class Time Table updated' });
                }

            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/StudentNotificationsOK/:email', async (req, res) => {      
            const email = req.params.email;
            try {
                await ResultModel.updateOne(
                    { stuEmail : email },
                    {resNot : '0'}
                );
            
                await StudentModel.updateOne(
                    { email: email },
                    {exttNot : '0', ttNot: '0'}
                );

                res.json({ message: 'ok' });

            } catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

app.listen(3001, () => {
    console.log("server is running")
})