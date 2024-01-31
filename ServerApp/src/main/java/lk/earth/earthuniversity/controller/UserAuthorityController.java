package lk.earth.earthuniversity.controller;

import lk.earth.earthuniversity.dao.UserDao;
import lk.earth.earthuniversity.entity.Privilege;
import lk.earth.earthuniversity.entity.User;
import lk.earth.earthuniversity.entity.Userrole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping(value = "/authorities")
public class UserAuthorityController {

    @Autowired
    private UserDao userdao;

    @GetMapping("/{username}")
    @ResponseStatus(HttpStatus.CREATED)
    public List<String> getUserAuthoritiesByUsername(@PathVariable String username) {
        User user = userdao.findByUsername(username);
        List<String> authorities = new ArrayList<>();

        if (user != null){
            List<Userrole> userroles = (List<Userrole>) user.getUserroles();

            for (Userrole u : userroles) {
                List<Privilege> Privileges = (List<Privilege>) u.getRole().getPrivileges();
                for (Privilege p : Privileges) {
                    String authority = p.getAuthority();
                    authorities.add(authority);
                }
            }
        }else{
            authorities = Arrays.asList(
                    "user-select","user-delete","user-update","user-insert",
                    "privilege-select","privilege-delete","privilege-update","privilege-insert",
                    "employee-select","employee-delete","employee-update","employee-insert",
                    "operations-select","operations-delete","operations-update","operations-insert",

                    "program-select","program-delete","program-update","program-insert",
                    "course-select","course-delete","course-update","course-insert",
                    "Batch-select","Batch-delete","Batch-update","Batch-insert",
                    "Payment Schedule-select","Payment Schedule-delete","Payment Schedule-update","Payment Schedule-insert",
                    "Course Materiale-select","Course Material-delete","Course Material-update","Course Material-insert",

                    "Mat. Distribution-select","Mat. Distribution-delete","Mat. Distribution-update","Mat. Distribution-insert",
                    "Payments-select","Payments-delete","Payments-update","Payments-insert",
                    "student-select","student-delete","student-update","student-insert",
                    "Batch Registration-select","Batch Registration-delete","Batch Registration-update","Batch Registration-insert",

                    "Class Schedule-select","Class Schedule-delete","Class Schedule-update","Class Schedule-insert",
                    "Attendance-select","Attendance-delete","Attendance-update","Attendance-insert",
                    "Progress Review-select","Progress Review-delete","Progress Review-update","Progress Review-insert"
            );
        }

        return authorities;
    }
}
